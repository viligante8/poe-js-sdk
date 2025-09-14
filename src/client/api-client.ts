import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  Profile,
  League,
  Character,
  StashTab,
  PvpMatch,
  LeagueAccount,
  RateLimitInfo,
  Realm,
} from '../types';

export interface ClientConfig {
  accessToken?: string;
  userAgent: string;
  baseURL?: string;
}

export class PoEApiClient {
  private client: AxiosInstance;
  private rateLimitInfo: RateLimitInfo = {};

  constructor(config: ClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.pathofexile.com',
      headers: {
        'User-Agent': config.userAgent,
        ...(config.accessToken && {
          Authorization: `Bearer ${config.accessToken}`,
        }),
      },
    });

    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.updateRateLimitInfo(error.response);
        }
        throw error;
      }
    );
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers;
    const retryAfter = headers['retry-after'];
    this.rateLimitInfo = {
      policy: headers['x-rate-limit-policy'],
      rules: headers['x-rate-limit-rules'],
      account: headers['x-rate-limit-account'],
      ip: headers['x-rate-limit-ip'],
      client: headers['x-rate-limit-client'],
      ...(retryAfter && { retryAfter: parseInt(retryAfter) }),
    };
  }

  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  setAccessToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  // Profile endpoints
  async getProfile(): Promise<Profile> {
    const response = await this.client.get<Profile>('/profile');
    return response.data;
  }

  // League endpoints
  async getLeagues(realm?: Realm): Promise<League[]> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<League[]>('/league', { params });
    return response.data;
  }

  async getLeague(leagueId: string, realm?: Realm): Promise<League> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<League>(`/league/${leagueId}`, {
      params,
    });
    return response.data;
  }

  async getLeagueLadder(
    leagueId: string,
    options?: {
      realm?: Realm;
      offset?: number;
      limit?: number;
      type?: string;
      track?: string;
      accountName?: string;
    }
  ): Promise<any> {
    const response = await this.client.get(`/league/${leagueId}/ladder`, {
      params: options,
    });
    return response.data;
  }

  // Character endpoints
  async getCharacters(realm?: Realm): Promise<Character[]> {
    const url = realm ? `/character/${realm}` : '/character';
    const response = await this.client.get<Character[]>(url);
    return response.data;
  }

  async getCharacter(name: string, realm?: Realm): Promise<Character> {
    const url = realm ? `/character/${realm}/${name}` : `/character/${name}`;
    const response = await this.client.get<Character>(url);
    return response.data;
  }

  // Stash endpoints (PoE1 only)
  async getStashes(league: string, realm?: Realm): Promise<StashTab[]> {
    const url = realm ? `/stash/${realm}/${league}` : `/stash/${league}`;
    const response = await this.client.get<{ stashes: StashTab[] }>(url);
    return response.data.stashes;
  }

  async getStash(
    league: string,
    stashId: string,
    substashId?: string,
    realm?: Realm
  ): Promise<StashTab> {
    const baseUrl = realm ? `/stash/${realm}/${league}` : `/stash/${league}`;
    const url = substashId
      ? `${baseUrl}/${stashId}/${substashId}`
      : `${baseUrl}/${stashId}`;
    const response = await this.client.get<StashTab>(url);
    return response.data;
  }

  // League account endpoints (PoE1 only)
  async getLeagueAccount(
    league: string,
    realm?: Realm
  ): Promise<LeagueAccount> {
    const url = realm
      ? `/league-account/${realm}/${league}`
      : `/league-account/${league}`;
    const response = await this.client.get<LeagueAccount>(url);
    return response.data;
  }

  // PvP Match endpoints (PoE1 only)
  async getPvpMatches(realm?: Realm): Promise<PvpMatch[]> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<PvpMatch[]>('/pvp-match', {
      params,
    });
    return response.data;
  }

  async getPvpMatch(matchId: string, realm?: Realm): Promise<PvpMatch> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<PvpMatch>(`/pvp-match/${matchId}`, {
      params,
    });
    return response.data;
  }

  // Public Stash API (PoE1 only)
  async getPublicStashes(options?: {
    realm?: Realm;
    id?: string;
  }): Promise<any> {
    const url = options?.realm
      ? `/public-stash-tabs/${options.realm}`
      : '/public-stash-tabs';
    const params = options?.id ? { id: options.id } : {};
    const response = await this.client.get(url, { params });
    return response.data;
  }

  // Currency Exchange API
  async getCurrencyExchange(realm?: Realm, id?: string): Promise<any> {
    let url = '/currency-exchange';
    if (realm) url += `/${realm}`;
    if (id) url += `/${id}`;

    const response = await this.client.get(url);
    return response.data;
  }

  // Item Filter endpoints
  async getItemFilters(): Promise<any> {
    const response = await this.client.get('/item-filter');
    return response.data;
  }

  async getItemFilter(filterId: string): Promise<any> {
    const response = await this.client.get(`/item-filter/${filterId}`);
    return response.data;
  }

  async createItemFilter(filter: any): Promise<any> {
    const response = await this.client.post('/item-filter', filter);
    return response.data;
  }

  async updateItemFilter(filterId: string, filter: any): Promise<any> {
    const response = await this.client.post(`/item-filter/${filterId}`, filter);
    return response.data;
  }
}
