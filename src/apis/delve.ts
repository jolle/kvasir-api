import request, {
  RequestPromise,
  RequestPromiseOptions,
} from 'request-promise';
import cheerio from 'cheerio';
import { Response, RequestAPI, RequiredUriUrl } from 'request';
import { parse } from 'url';
import { Cookie } from 'tough-cookie';
import { State } from '../State';

async function retry<T>(
  fn: () => Promise<T>,
  retriesLeft: number = -1,
  interval: number = 1000,
  exponential: boolean = false
): Promise<T> {
  try {
    const val = await fn();
    return val;
  } catch (error) {
    if (retriesLeft !== 0) {
      await new Promise((r) => setTimeout(r, interval));
      return retry(
        fn,
        retriesLeft - 1,
        exponential ? interval * 2 : interval,
        exponential
      );
    } else throw new Error(`Max retries reached for function ${fn.name}`);
  }
}

export class DelveAPI {
  private rq: RequestAPI<RequestPromise, RequestPromiseOptions, RequiredUriUrl>;
  private jar = request.jar();
  private delveHostname?: string;

  private cachedCredentials?: { username: string; password: string };
  private loginPromise?: Promise<void>;

  constructor() {
    this.rq = request.defaults({
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.14; rv:58.0) Gecko/20100101 Firefox/58.0',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      jar: this.jar,
    });
  }

  private redirectTransformer(
    body: any,
    response: Response,
    resolveWithFullResponse?: boolean
  ): any {
    if (response.headers.location) {
      return this.rq.get(response.headers.location, {
        transform: this.redirectTransformer,
      });
    } else {
      return resolveWithFullResponse ? response : body;
    }
  }

  async login(username: string, password: string): Promise<void> {
    this.reset();

    this.loginPromise = (async () => {
      await retry(() => this.tryToLogin(username, password));
      this.cachedCredentials = { username, password };
    })();

    await this.loginPromise;

    this.loginPromise = undefined;
  }

  private async tryToLogin(username: string, password: string) {
    const delveRedirectData = await this.rq.get('https://delve.office.com/');
    const $drd = cheerio.load(delveRedirectData);

    const configScript = Array.from(
      $drd('script[type="text/javascript"]')
    ).find((el) => ($drd(el).html() || '').includes('$Config'));

    if (!configScript) throw Error('Failed to initiate login');

    const loginData = JSON.parse(
      ($drd(configScript).html() || '{}')
        .replace(/^\/\/<!\[CDATA\[/, '')
        .replace(/\/\/\]\]>$/, '')
        .trim()
        .replace(/;$/, '')
        .replace(/^\$Config=/, '')
    );

    if (!loginData || Object.keys(loginData).length === 0)
      throw Error('Unknown login response');

    const { Credentials } = await this.rq.post(
      'https://login.microsoftonline.com/common/GetCredentialType?mkt=en-US',
      {
        json: {
          username,
          isOtherIdpSupported: false,
          checkPhones: false,
          isRemoteNGCSupported: true,
          isCookieBannerShown: false,
          isFidoSupported: false,
          originalRequest: loginData.sCtx,
          country: 'US',
          forceotclogin: false,
          [loginData.sFTName]: loginData.sFT,
        },
      }
    );

    if (!Credentials.FederationRedirectUrl)
      throw Error(
        "Credentials.FederationRedirectUrl doesn't exist: " + Credentials
      );

    await this.rq.get(Credentials.FederationRedirectUrl);

    const adfsRedirectUrl = (
      await this.rq.post(Credentials.FederationRedirectUrl, {
        form: {
          UserName: username,
          Password: password,
          AuthMethod: 'FormsAuthentication',
        },
        simple: false,
        resolveWithFullResponse: true,
      })
    ).headers.location;

    if (!adfsRedirectUrl) throw Error('adfsRedirectUrl is undefined');

    const adfs = await this.rq.get(adfsRedirectUrl);
    const form = cheerio.load(adfs)('form');

    if (!form.attr('action')) throw Error('Form action is undefined: ' + adfs);

    const delve = await this.rq.post(form.attr('action')!, {
      body: form.serialize(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const delveRedirForm = cheerio.load(delve)('form');

    if (!delveRedirForm.attr('action'))
      throw Error('Delve form action is undefined: ' + delve);

    const eurDelve = await this.rq.post(delveRedirForm.attr('action')!, {
      body: delveRedirForm.serialize(),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      simple: false,
      transform: this.redirectTransformer.bind(this),
    });
    const eurDelveRedirForm = cheerio.load(eurDelve)('form');

    if (eurDelve.includes('pulseRoot')) {
      this.delveHostname = parse(delveRedirForm.attr('action')!).host!;
      return;
    }

    if (!eurDelveRedirForm.attr('action')) {
      console.log('Eur Delve form action is undefined: ' + eurDelve);
      this.reset();
      return this.login(username, password);
    }

    try {
      await this.rq.post(eurDelveRedirForm.attr('action')!, {
        body: eurDelveRedirForm.serialize(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        simple: false,
        transform: this.redirectTransformer.bind(this),
      });
    } catch (e) {
      console.error('login error:', e.body);
    }

    this.delveHostname = parse(eurDelveRedirForm.attr('action')!).host!;
  }

  reset() {
    this.jar = request.jar();
    this.rq = this.rq.defaults({
      jar: this.jar,
    });
    this.delveHostname = undefined;
  }

  async searchPeople(
    query: string
  ): Promise<{
    TotalCount: number;
    Count: number;
    Offset: number;
    QueryText: string;
    Results: {
      Id: string;
      FullName: string;
      Email: string;
      UserName: string;
      OfficeLocation: string;
      JobTitle: string;
      ProfileImageAddress: string;
      SipAddress: string;
      AccountName: string;
      Department: string;
      ExtraEmails: string[];
      AadObjectId: string;
      Interests: string;
      HitHighlightedProperties: string;
      Memberships: string;
      PastProjects: string;
      Responsibilities: string;
      Schools: string;
      Skills: string;
      ItemSource: string;
    }[];
  }> {
    if (this.loginPromise) await this.loginPromise;

    if (!this.delveHostname) throw Error('No valid session exists');

    try {
      return JSON.parse(
        await this.rq.get(`https://${this.delveHostname}/mt/v3/search/people`, {
          qs: {
            queryText: query,
            top: '100',
            skip: 0,
            flights:
              "'PulseWebExternalContent,PulseWebStoryCards,PulseWebVideoCards,DelveOnOLS,PulseWebFallbackCards,PulseWebContentTypesWave1,PulseWebContentTypeFilter%27&overrides=olsmodified,olsrelatedpeople,olsinfeed",
          },
        })
      );
    } catch (e) {
      if (e.statusCode && e.statusCode === 401) {
        console.log('Delve session expired, logging in...');
      } else {
        console.log(e);
      }

      if (!this.loginPromise && this.cachedCredentials)
        this.login(
          this.cachedCredentials.username,
          this.cachedCredentials.password
        );

      return this.searchPeople(query);
    }
  }

  async getPeopleSuggestions(
    query: string
  ): Promise<{
    TotalCount: number;
    Count: number;
    Offset: number;
    QueryText: string;
    Results: {
      FullName: string;
      Email: string;
      UserName: string;
      JobTitle: string;
      ProfileImageAddress: string;
      ItemSource: string;
    }[];
  }> {
    if (this.loginPromise) await this.loginPromise;

    if (!this.delveHostname) throw Error('No valid session exists');

    try {
      return JSON.parse(
        await this.rq.get(
          `https://${this.delveHostname}/mt/v3/search/peoplesuggestions`,
          {
            qs: {
              queryText: query,
            },
          }
        )
      );
    } catch (e) {
      if (e.statusCode && e.statusCode === 401) {
        console.log('Delve session expired, logging in...');
      } else {
        console.log(e);
      }

      if (!this.loginPromise && this.cachedCredentials)
        this.login(
          this.cachedCredentials.username,
          this.cachedCredentials.password
        );

      return this.getPeopleSuggestions(query);
    }
  }

  async getPerson(
    email: string
  ): Promise<{
    FullName: string;
    Email: string;
    UserName: string;
    OfficeLocation: string;
    JobTitle: string;
    ProfileImageAddress: string;
    SipAddress: string;
    Department: string;
    AadObjectId: string;
    UserPrincipleName: string;
    ItemSource: string;
  }> {
    if (this.loginPromise) await this.loginPromise;

    if (!this.delveHostname) throw Error('No valid session exists');

    try {
      return JSON.parse(
        await this.rq.get(
          `https://${this.delveHostname}/mt/v3/people/${encodeURIComponent(
            email
          )}`
        )
      );
    } catch (e) {
      if (e.statusCode && e.statusCode === 401) {
        console.log('Delve session expired, logging in...');
      } else {
        return JSON.parse(e.body);
      }

      if (!this.loginPromise && this.cachedCredentials)
        await this.login(
          this.cachedCredentials.username,
          this.cachedCredentials.password
        );

      return this.getPerson(email);
    }
  }

  getState() {
    return {
      delveHostname: this.delveHostname,
      cookies: (this.jar as any)._jar.store,
      credentials: this.cachedCredentials,
    };
  }

  setState({
    delveHostname,
    cookies,
    credentials,
  }: {
    delveHostname: string;
    cookies: any;
    credentials: any;
  }) {
    this.delveHostname = delveHostname;
    this.cachedCredentials = credentials;

    (Object.values(cookies.idx)
      .map((value: any) => Object.values(value))
      .reduce((p, n) => [...p, ...n], []) // flat
      .map((value: any) => Object.values(value))
      .reduce(
        (p, n) => [...p, ...n],
        []
      ) as any).forEach((cookie: Cookie.Properties) =>
      this.jar.setCookie(
        new Cookie(cookie).cookieString(),
        `http${cookie.secure}://${cookie.domain}/`
      )
    );
  }
}

let localState: any;
export const getDelveInstance = async (state: State) => {
  const delveApi = new DelveAPI();

  if (localState) {
    delveApi.setState(localState);
    return delveApi;
  }

  const delveState = await state.get('delve-state');
  if (delveState) {
    localState = JSON.parse(delveState);
    delveApi.setState(localState);
    return delveApi;
  }

  await delveApi.login(
    process.env.DELVE_USERNAME!,
    process.env.DELVE_PASSWORD!
  );

  localState = delveApi.getState();
  await state.set('delve-state', JSON.stringify(localState), 24 * 60 * 60);

  return delveApi;
};
