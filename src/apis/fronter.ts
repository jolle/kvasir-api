import Axios from 'axios';
import { load } from 'cheerio';
import uuid from 'uuid/v5';
import iconv from 'iconv-lite';

const FRONTER_API_UUID_NAMESPACE = 'f0e71b34-e816-449d-adda-07afc6bea55a';

const retry = (retries: number) => (promiseFn: () => Promise<any>) => {
  let tried = 0;

  const tryPromise = (): Promise<any> =>
    promiseFn().catch(e => {
      if (tried++ <= retries) return tryPromise();
      throw e;
    });

  return tryPromise();
};

export class FronterAPICourse {
  id: string;
  wcid: string;
  endpoint: string;
  name: string;

  constructor(endpoint: string, wcid: string, id: string, name: string) {
    this.endpoint = endpoint;
    this.wcid = wcid;
    this.id = id;
    this.name = name;
  }

  getUsers() {
    return Axios.get(
      `${this.endpoint}/contacts/users.phtml?fronter_request_token=&order=3&searchpressed=1&matchgrp=&listgrp=${this.id}&number_of_results_pr_page=200`,
      {
        headers: {
          Cookie: `wcid=${this.wcid}`
        },
        responseType: 'arraybuffer'
      }
    )
      .then(({ data }) =>
        load(
          iconv.decode(
            data,
            (data.toString().match(/charset=([^']+)'/) || [
              '',
              'windows-1252'
            ])[1]
          )
        )
      )
      .then($ =>
        Array.from($('.contact-search-results a.black-link')).map(a => ({
          uuid: uuid(
            $(a)
              .parent()
              .find('input[type="checkbox"][name^="addr["]')
              .val(),
            FRONTER_API_UUID_NAMESPACE
          ),
          id:
            $(a)
              .text()
              .trim()
              .split(/,[^A-ZÄÖÅ]+/)
              .reverse()
              .join('.')
              .toLowerCase()
              .replace(/ä/gi, 'a')
              .replace(/ö/gi, 'ö')
              .replace(/å/gi, 'a') + '@edu.hel.fi',
          name: $(a)
            .text()
            .trim()
            .replace(/,[^A-ZÄÖÅ]+/, ', ')
        }))
      );
  }
}

export class FronterAPI {
  wcid: string = '';
  endpoint: string;

  constructor(endpoint: string, wcid?: string) {
    this.endpoint = endpoint;
    if (wcid) this.wcid = wcid;
  }

  login(username: string, password: string): Promise<any> {
    return retry(5)(() =>
      Axios.post(
        `${this.endpoint}/index.phtml`,
        `fronter_request_token=&username=${username}&password=${password}&newlang=en&saveid=-1&mainurl=main.phtml&chp=&screenSize=1680x1050&SSO_COMMAND=&SSO_COMMAND_SECHASH=`
      ).then(res => {
        const cookies = res.headers['set-cookie'];
        const wcid = cookies.find((a: string) => a.startsWith('wcid='));

        if (!wcid) throw Error('Unable to log in');

        this.wcid = wcid.split(';')[0].split('=')[1];
      })
    );
  }

  getCourses(): Promise<FronterAPICourse[]> {
    const signature = Array(7)
      .fill('|&nbsp;&nbsp;&nbsp;&nbsp;')
      .join('');

    return Axios.get(
      `${this.endpoint}/contacts/users.phtml?fronter_request_token=&order=3&searchpressed=0&matchgrp=&listgrp=show_all_groups`,
      {
        headers: {
          Cookie: `wcid=${this.wcid}`
        }
      }
    ).then(({ data }) =>
      data
        .split('\n')
        .filter((a: string) => a.indexOf(signature) > -1)
        .map(
          (a: string) =>
            new FronterAPICourse(
              this.endpoint,
              this.wcid,
              (a.match(/value="([^"]+)"/) || [])[1],
              a.split(signature).pop() || ''
            )
        )
    );
  }
}
