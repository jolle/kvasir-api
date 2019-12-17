import { State } from '../State';
import * as sprequest from 'sp-request';
import { ISPRequest } from 'sp-request';
import { OnlineUserCredentials } from 'node-sp-auth/lib/src/auth/resolvers/OnlineUserCredentials';

export interface SPSearchEntity {
  Rank: number;
  DocId: number;
  AboutMe?: any;
  AccountName: string;
  BaseOfficeLocation?: any;
  Department: string;
  HitHighlightedProperties: string;
  Interests: string;
  JobTitle: string;
  LastModifiedTime: Date;
  Memberships: string;
  PastProjects: string;
  Path: string;
  PictureURL: string;
  PreferredName: string;
  Responsibilities: string;
  Schools: string;
  ServiceApplicationID: string;
  SipAddress: string;
  Skills: string;
  UserProfile_GUID: string;
  WorkEmail: string;
  WorkId: number;
  YomiDisplayName?: any;
  OriginalPath: string;
  RenderTemplateId: string;
  _ranking_features_: string;
  ResultTypeIdList: string;
  PartitionId: string;
  UrlZone: number;
  Culture: string;
  ResultTypeId: number;
  EditProfileUrl?: any;
  ProfileViewsLastMonth?: any;
  ProfileViewsLastWeek?: any;
  ProfileQueriesFoundYou?: any;
  piSearchResultId: string;
}

export class SharepointAPI {
  private spr?: ISPRequest;

  private cachedCredentials?: { username: string; password: string };
  private state?: State;

  async login(username: string, password: string, state?: State) {
    this.reset();

    this.spr = sprequest.create({
      username,
      password,
    });

    this.state = state;
    this.cachedCredentials = { username, password };
  }

  reset() {
    this.spr = undefined;
  }

  private makeQuery(query: string): string {
    return `<Request xmlns="http://schemas.microsoft.com/sharepoint/clientquery/2009" SchemaVersion="15.0.0.0" LibraryVersion="16.0.0.0" ApplicationName="Javascript Library"><Actions><ObjectPath Id="2223" ObjectPathId="2222" /><SetProperty Id="2224" ObjectPathId="2222" Name="TimeZoneId"><Parameter Type="Number">13</Parameter></SetProperty><SetProperty Id="2225" ObjectPathId="2222" Name="QueryText"><Parameter Type="String">${query}</Parameter></SetProperty><SetProperty Id="2226" ObjectPathId="2222" Name="QueryTemplate"><Parameter Type="String">{searchboxquery}</Parameter></SetProperty><SetProperty Id="2227" ObjectPathId="2222" Name="Culture"><Parameter Type="Number">1035</Parameter></SetProperty><SetProperty Id="2228" ObjectPathId="2222" Name="RowsPerPage"><Parameter Type="Number">100</Parameter></SetProperty><SetProperty Id="2229" ObjectPathId="2222" Name="RowLimit"><Parameter Type="Number">100</Parameter></SetProperty><SetProperty Id="2230" ObjectPathId="2222" Name="TotalRowsExactMinimum"><Parameter Type="Number">11</Parameter></SetProperty><SetProperty Id="2231" ObjectPathId="2222" Name="SourceId"><Parameter Type="Guid">{b09a7990-05ea-4af9-81ef-edfab16c4e31}</Parameter></SetProperty><SetProperty Id="2232" ObjectPathId="2222" Name="Refiners"><Parameter Type="String">Department(filter=7/0/*),JobTitle(filter=7/0/*),PeopleKeywords(filter=7/0/*),BaseOfficeLocation(filter=7/0/*)</Parameter></SetProperty><ObjectPath Id="2234" ObjectPathId="2233" /><Method Name="Add" Id="2235" ObjectPathId="2233"><Parameters><Parameter Type="String">AboutMe</Parameter></Parameters></Method><Method Name="Add" Id="2236" ObjectPathId="2233"><Parameters><Parameter Type="String">AccountName</Parameter></Parameters></Method><Method Name="Add" Id="2237" ObjectPathId="2233"><Parameters><Parameter Type="String">BaseOfficeLocation</Parameter></Parameters></Method><Method Name="Add" Id="2238" ObjectPathId="2233"><Parameters><Parameter Type="String">Department</Parameter></Parameters></Method><Method Name="Add" Id="2239" ObjectPathId="2233"><Parameters><Parameter Type="String">HitHighlightedProperties</Parameter></Parameters></Method><Method Name="Add" Id="2240" ObjectPathId="2233"><Parameters><Parameter Type="String">Interests</Parameter></Parameters></Method><Method Name="Add" Id="2241" ObjectPathId="2233"><Parameters><Parameter Type="String">JobTitle</Parameter></Parameters></Method><Method Name="Add" Id="2242" ObjectPathId="2233"><Parameters><Parameter Type="String">LastModifiedTime</Parameter></Parameters></Method><Method Name="Add" Id="2243" ObjectPathId="2233"><Parameters><Parameter Type="String">Memberships</Parameter></Parameters></Method><Method Name="Add" Id="2244" ObjectPathId="2233"><Parameters><Parameter Type="String">PastProjects</Parameter></Parameters></Method><Method Name="Add" Id="2245" ObjectPathId="2233"><Parameters><Parameter Type="String">Path</Parameter></Parameters></Method><Method Name="Add" Id="2246" ObjectPathId="2233"><Parameters><Parameter Type="String">PictureURL</Parameter></Parameters></Method><Method Name="Add" Id="2247" ObjectPathId="2233"><Parameters><Parameter Type="String">PreferredName</Parameter></Parameters></Method><Method Name="Add" Id="2248" ObjectPathId="2233"><Parameters><Parameter Type="String">RenderTemplateId</Parameter></Parameters></Method><Method Name="Add" Id="2249" ObjectPathId="2233"><Parameters><Parameter Type="String">Responsibilities</Parameter></Parameters></Method><Method Name="Add" Id="2250" ObjectPathId="2233"><Parameters><Parameter Type="String">ResultTypeId</Parameter></Parameters></Method><Method Name="Add" Id="2251" ObjectPathId="2233"><Parameters><Parameter Type="String">ResultTypeIdList</Parameter></Parameters></Method><Method Name="Add" Id="2252" ObjectPathId="2233"><Parameters><Parameter Type="String">Schools</Parameter></Parameters></Method><Method Name="Add" Id="2253" ObjectPathId="2233"><Parameters><Parameter Type="String">ServiceApplicationID</Parameter></Parameters></Method><Method Name="Add" Id="2254" ObjectPathId="2233"><Parameters><Parameter Type="String">SipAddress</Parameter></Parameters></Method><Method Name="Add" Id="2255" ObjectPathId="2233"><Parameters><Parameter Type="String">Skills</Parameter></Parameters></Method><Method Name="Add" Id="2256" ObjectPathId="2233"><Parameters><Parameter Type="String">UserProfile_GUID</Parameter></Parameters></Method><Method Name="Add" Id="2257" ObjectPathId="2233"><Parameters><Parameter Type="String">WorkEmail</Parameter></Parameters></Method><Method Name="Add" Id="2258" ObjectPathId="2233"><Parameters><Parameter Type="String">WorkId</Parameter></Parameters></Method><Method Name="Add" Id="2259" ObjectPathId="2233"><Parameters><Parameter Type="String">YomiDisplayName</Parameter></Parameters></Method><ObjectPath Id="2261" ObjectPathId="2260" /><Method Name="Add" Id="2262" ObjectPathId="2260"><Parameters><Parameter Type="String">AboutMe</Parameter></Parameters></Method><Method Name="Add" Id="2263" ObjectPathId="2260"><Parameters><Parameter Type="String">BaseOfficeLocation</Parameter></Parameters></Method><Method Name="Add" Id="2264" ObjectPathId="2260"><Parameters><Parameter Type="String">Department</Parameter></Parameters></Method><Method Name="Add" Id="2265" ObjectPathId="2260"><Parameters><Parameter Type="String">Interests</Parameter></Parameters></Method><Method Name="Add" Id="2266" ObjectPathId="2260"><Parameters><Parameter Type="String">JobTitle</Parameter></Parameters></Method><Method Name="Add" Id="2267" ObjectPathId="2260"><Parameters><Parameter Type="String">Memberships</Parameter></Parameters></Method><Method Name="Add" Id="2268" ObjectPathId="2260"><Parameters><Parameter Type="String">PastProjects</Parameter></Parameters></Method><Method Name="Add" Id="2269" ObjectPathId="2260"><Parameters><Parameter Type="String">PreferredName</Parameter></Parameters></Method><Method Name="Add" Id="2270" ObjectPathId="2260"><Parameters><Parameter Type="String">Responsibilities</Parameter></Parameters></Method><Method Name="Add" Id="2271" ObjectPathId="2260"><Parameters><Parameter Type="String">Schools</Parameter></Parameters></Method><Method Name="Add" Id="2272" ObjectPathId="2260"><Parameters><Parameter Type="String">SipAddress</Parameter></Parameters></Method><Method Name="Add" Id="2273" ObjectPathId="2260"><Parameters><Parameter Type="String">Skills</Parameter></Parameters></Method><Method Name="Add" Id="2274" ObjectPathId="2260"><Parameters><Parameter Type="String">WorkEmail</Parameter></Parameters></Method><Method Name="Add" Id="2275" ObjectPathId="2260"><Parameters><Parameter Type="String">YomiDisplayName</Parameter></Parameters></Method><SetProperty Id="2276" ObjectPathId="2222" Name="RankingModelId"><Parameter Type="String">D9BFB1A1-9036-4627-83B2-BBD9983AC8A1</Parameter></SetProperty><SetProperty Id="2277" ObjectPathId="2222" Name="EnablePhonetic"><Parameter Type="Boolean">true</Parameter></SetProperty><SetProperty Id="2278" ObjectPathId="2222" Name="EnableNicknames"><Parameter Type="Boolean">true</Parameter></SetProperty><SetProperty Id="2279" ObjectPathId="2222" Name="TrimDuplicates"><Parameter Type="Boolean">false</Parameter></SetProperty><ObjectPath Id="2281" ObjectPathId="2280" /><Method Name="SetQueryPropertyValue" Id="2282" ObjectPathId="2280"><Parameters><Parameter Type="String">CrossGeoQuery</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">0</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">1</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="String">false</Property></Parameter></Parameters></Method><Method Name="SetQueryPropertyValue" Id="2283" ObjectPathId="2280"><Parameters><Parameter Type="String">ContentSetting</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">0</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">0</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="Null" /></Parameter></Parameters></Method><Method Name="SetQueryPropertyValue" Id="2284" ObjectPathId="2280"><Parameters><Parameter Type="String">ListId</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">0</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">1</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="String">5564b79e-4852-45e4-b1f1-9a9d7ce05583</Property></Parameter></Parameters></Method><Method Name="SetQueryPropertyValue" Id="2285" ObjectPathId="2280"><Parameters><Parameter Type="String">ListItemId</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">5</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">2</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="Null" /></Parameter></Parameters></Method><ObjectPath Id="2287" ObjectPathId="2286" /><SetProperty Id="2288" ObjectPathId="2222" Name="PersonalizationData"><Parameter ObjectPathId="2286" /></SetProperty><SetProperty Id="2289" ObjectPathId="2222" Name="ResultsUrl"><Parameter Type="String">https://${process
      .env
      .SHAREPOINT_ENDPOINT!}/search/Sivut/peopleresults.aspx</Parameter></SetProperty><SetProperty Id="2290" ObjectPathId="2222" Name="ClientType"><Parameter Type="String">PeopleResultsQuery</Parameter></SetProperty><Method Name="SetQueryPropertyValue" Id="2291" ObjectPathId="2280"><Parameters><Parameter Type="String">QuerySession</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">0</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">1</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="String">b31db2ea-2db2-4d93-b849-65ab1ac63aa3</Property></Parameter></Parameters></Method><SetProperty Id="2292" ObjectPathId="2222" Name="ProcessPersonalFavorites"><Parameter Type="Boolean">false</Parameter></SetProperty><SetProperty Id="2293" ObjectPathId="2222" Name="EnableOrderingHitHighlightedProperty"><Parameter Type="Boolean">true</Parameter></SetProperty><SetProperty Id="2294" ObjectPathId="2222" Name="HitHighlightedMultivaluePropertyLimit"><Parameter Type="Number">5</Parameter></SetProperty><SetProperty Id="2295" ObjectPathId="2222" Name="SafeQueryPropertiesTemplateUrl"><Parameter Type="String">querygroup://webroot/Sivut/peopleresults.aspx?groupname=Default</Parameter></SetProperty><SetProperty Id="2296" ObjectPathId="2222" Name="IgnoreSafeQueryPropertiesTemplateUrl"><Parameter Type="Boolean">false</Parameter></SetProperty><Method Name="SetQueryPropertyValue" Id="2297" ObjectPathId="2280"><Parameters><Parameter Type="String">QueryDateTimeCulture</Parameter><Parameter TypeId="{b25ba502-71d7-4ae4-a701-4ca2fb1223be}"><Property Name="BoolVal" Type="Boolean">false</Property><Property Name="IntVal" Type="Number">1035</Property><Property Name="QueryPropertyValueTypeIndex" Type="Number">2</Property><Property Name="StrArray" Type="Null" /><Property Name="StrVal" Type="Null" /></Parameter></Parameters></Method><ObjectPath Id="2299" ObjectPathId="2298" /><ExceptionHandlingScope Id="2300"><TryScope Id="2302"><Method Name="ExecuteQueries" Id="2304" ObjectPathId="2298"><Parameters><Parameter Type="Array"><Object Type="String">9ffac4a2-e09e-4766-ac39-d0e93750f582Default</Object></Parameter><Parameter Type="Array"><Object ObjectPathId="2222" /></Parameter><Parameter Type="Boolean">true</Parameter></Parameters></Method></TryScope><CatchScope Id="2306" /></ExceptionHandlingScope></Actions><ObjectPaths><Constructor Id="2222" TypeId="{80173281-fffd-47b6-9a49-312e06ff8428}" /><Property Id="2233" ParentId="2222" Name="SelectProperties" /><Property Id="2260" ParentId="2222" Name="HitHighlightedProperties" /><Property Id="2280" ParentId="2222" Name="Properties" /><Constructor Id="2286" TypeId="{28d79f49-820a-4d51-bb2a-3309b3f4c54d}"><Parameters><Parameter Type="String">3622da6d-fd52-42fa-9d61-09e279a35f61</Parameter></Parameters></Constructor><Constructor Id="2298" TypeId="{8d2ac302-db2f-46fe-9015-872b35f15098}" /></ObjectPaths></Request>`.replace(
      /\s*\n/g,
      ''
    );
  }

  async searchPeople(query: string): Promise<SPSearchEntity[]> {
    if (!this.spr) throw Error('No valid session exists');

    const digest = await this.spr.requestDigest(
      `https://${process.env.SHAREPOINT_ENDPOINT!}/search/`
    );
    const { body } = await this.spr
      .post(
        `https://${process.env
          .SHAREPOINT_ENDPOINT!}/search/_vti_bin/client.svc/ProcessQuery`,
        {
          body: this.makeQuery(query),
          headers: {
            'X-RequestDigest': digest,
            'Content-Type': 'text/xml',
            Accept: '*/*',
          },
          json: false,
        }
      )
      .catch((a) => a);

    const result = JSON.parse(body).find(
      (el: any) =>
        typeof el === 'object' &&
        Object.keys(el).findIndex((a) => a.endsWith('Default')) > -1
    );

    if (!result) throw Error('Not found');

    if (this.state)
      this.state.set(
        'sharepoint-state',
        JSON.stringify(this.getState()),
        24 * 60 * 60
      );

    return (Object.values(result)[0] as any).ResultTables[0].ResultRows;
  }

  getState() {
    return {
      credentials: this.cachedCredentials,
      cache: Object.entries(
        (OnlineUserCredentials as any).CookieCache._cache as any
      )
        .map(([k, v]: [any, any]) => ({
          [k]: {
            data: v.data,
            expiration: v.expiration,
          },
        }))
        .reduce((p, n) => ({ ...p, ...n }), {}),
    };
  }

  setState({ credentials, cache }: { credentials: any; cache: any }) {
    this.cachedCredentials = credentials;

    this.login(
      this.cachedCredentials!.username,
      this.cachedCredentials!.password
    );

    if (cache) {
      Object.entries(cache).forEach(([k, v]: [any, any]) => {
        (OnlineUserCredentials as any).CookieCache.set(k, v.data, v.expiration);
      });
    }
  }
}

let localState: any;
export const getSPInstance = async (state: State) => {
  const spApi = new SharepointAPI();

  if (localState) {
    spApi.setState(localState);
    return spApi;
  }

  const spState = await state.get('sharepoint-state');
  if (spState) {
    localState = JSON.parse(spState);
    if (localState.cache) {
      spApi.setState(localState);
      return spApi;
    }
  }

  spApi.login(process.env.DELVE_USERNAME!, process.env.DELVE_PASSWORD!, state);

  return spApi;
};
