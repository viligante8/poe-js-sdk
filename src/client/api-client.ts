import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { PoEApiError } from '../errors/api-error';
import type {
  Profile,
  League,
  Character,
  StashTab,
  PvpMatch,
  LeagueAccount,
  RateLimitInfo,
  Realm,
  Ladder,
  EventLadderEntry,
  PvPLadderTeamEntry,
} from '../types';

/**
 * Configuration for {@link PoEApiClient}.
 */
export interface ClientConfig {
  accessToken?: string;
  userAgent: string;
  baseURL?: string;
}

/**
 * Official Path of Exile API client (PoE1 + limited PoE2).
 *
 * - Respects server rate limits automatically (parses X-Rate-Limit headers and Retry-After)
 * - Requires a compliant User-Agent (e.g. `OAuth myapp/1.0.0 (contact: you@example.com)`)
 * - Returns typed envelopes that mirror the official docs
 *
 * @see https://www.pathofexile.com/developer/docs/reference
 * @see https://www.pathofexile.com/developer/docs/index#ratelimits
 */
export class PoEApiClient {
  private client: AxiosInstance;
  private rateLimitInfo: RateLimitInfo = {};
  private nextAvailableAt = 0; // epoch ms when requests may resume

  /**
   * Create a new PoE API client.
   * @param config Client configuration (User-Agent required)
   */
  constructor(config: ClientConfig) {
    // Enforce User-Agent best practice per docs
    if (
      !config.userAgent?.startsWith('OAuth ') ||
      !/\(contact: .+\)/.test(config.userAgent)
    ) {
      throw new Error(
        'User-Agent must start with "OAuth " and include a contact: e.g. "OAuth myapp/1.0.0 (contact: you@example.com)"'
      );
    }

    this.client = axios.create({
      baseURL: config.baseURL || 'https://api.pathofexile.com',
      headers: {
        'User-Agent': config.userAgent,
        ...(config.accessToken && {
          Authorization: `Bearer ${config.accessToken}`,
        }),
      },
    });

    // Respect rate limits by waiting before requests when needed (guarded for tests)
    if (
      (
        this.client as unknown as {
          interceptors?: { request?: { use?: unknown } };
        }
      ).interceptors?.request?.use
    ) {
      this.client.interceptors.request.use(async (cfg) => {
        const now = Date.now();
        if (this.nextAvailableAt > now) {
          const waitMs = this.nextAvailableAt - now;
          await new Promise((r) => setTimeout(r, waitMs));
        }
        return cfg;
      });
    }

    this.client.interceptors.response.use(
      (response) => {
        this.updateRateLimitInfo(response);
        this.updateWaitFromHeaders(response);
        return response;
      },
      (error) => {
        if (error.response) {
          this.updateRateLimitInfo(error.response);
          this.updateWaitFromHeaders(error.response);
          // Handle 429 Too Many Requests
          if (error.response.status === 429) {
            const retryAfter = error.response.headers['retry-after'];
            const seconds = retryAfter ? parseInt(retryAfter) : 0;
            if (!Number.isNaN(seconds) && seconds > 0) {
              this.nextAvailableAt = Date.now() + seconds * 1000;
            }
          }
          const data = error.response.data as unknown;
          if (
            data &&
            typeof data === 'object' &&
            'error' in data &&
            (data as { error?: unknown }).error
          ) {
            const err = (
              data as { error: { code?: unknown; message?: string } }
            ).error;
            const status = error.response.status as number;
            const urlVal = error.config?.url as string | undefined;
            const headers = error.response.headers as Record<string, string>;
            const params: {
              code?: number;
              status: number;
              url?: string;
              details?: unknown;
              headers?: Record<string, string>;
            } = {
              status,
              details: data,
              headers,
            };
            if (urlVal) params.url = urlVal;
            if (typeof err.code === 'number') params.code = err.code as number;
            throw new PoEApiError(err.message || 'API error', params);
          }
        }
        throw error;
      }
    );
  }

  private updateRateLimitInfo(response: AxiosResponse): void {
    const headers = response.headers as unknown as Record<
      string,
      string | undefined
    >;
    const retryAfter = headers['retry-after'];
    const next: RateLimitInfo = {};
    if (headers['x-rate-limit-policy'])
      next.policy = headers['x-rate-limit-policy'] as string;
    if (headers['x-rate-limit-rules'])
      next.rules = headers['x-rate-limit-rules'] as string;
    if (headers['x-rate-limit-account'])
      next.account = headers['x-rate-limit-account'] as string;
    if (headers['x-rate-limit-ip'])
      next.ip = headers['x-rate-limit-ip'] as string;
    if (headers['x-rate-limit-client'])
      next.client = headers['x-rate-limit-client'] as string;
    if (headers['x-rate-limit-account-state'])
      next.accountState = headers['x-rate-limit-account-state'] as string;
    if (headers['x-rate-limit-ip-state'])
      next.ipState = headers['x-rate-limit-ip-state'] as string;
    if (headers['x-rate-limit-client-state'])
      next.clientState = headers['x-rate-limit-client-state'] as string;
    if (retryAfter) next.retryAfter = parseInt(retryAfter);
    this.rateLimitInfo = next;
  }

  /**
   * Get the latest parsed rate limit header values.
   * Includes optional `*-State` and `Retry-After` values when present.
   */
  getRateLimitInfo(): RateLimitInfo {
    return { ...this.rateLimitInfo };
  }

  /**
   * Update the access token used for Authorization header (Bearer scheme).
   */
  setAccessToken(token: string): void {
    this.client.defaults.headers.Authorization = `Bearer ${token}`;
  }

  private updateWaitFromHeaders(response: AxiosResponse): void {
    const headers = response.headers as unknown as Record<string, string>;
    // If any state header indicates an active restriction (third field > 0), wait that long
    const states = [
      headers['x-rate-limit-account-state'],
      headers['x-rate-limit-ip-state'],
      headers['x-rate-limit-client-state'],
    ].filter(Boolean) as string[];

    for (const state of states) {
      const parts = String(state).split(',');
      for (const p of parts) {
        const segs = p.split(':');
        if (segs.length === 3) {
          const active = Number.parseInt(segs[2] ?? '0');
          if (!Number.isNaN(active) && active > 0) {
            const candidate = Date.now() + active * 1000;
            if (candidate > this.nextAvailableAt) {
              this.nextAvailableAt = candidate;
            }
          }
        }
      }
    }
  }

  // Profile endpoints
  /**
   * Get account profile.
   * @see https://www.pathofexile.com/developer/docs/reference#profile
   */
  async getProfile(): Promise<Profile> {
    const response = await this.client.get<Profile>('/profile');
    return response.data;
  }

  // League endpoints
  /**
   * List leagues.
   * @see https://www.pathofexile.com/developer/docs/reference#leagues-list
   */
  async getLeagues(
    realmOrOptions?:
      | Realm
      | {
          realm?: Realm;
          type?: 'main' | 'event' | 'season';
          season?: string; // PoE1 only
          limit?: number; // max 50
          offset?: number;
        }
  ): Promise<{ leagues: League[] }> {
    const opts =
      typeof realmOrOptions === 'string' || realmOrOptions === undefined
        ? { realm: realmOrOptions as Realm | undefined }
        : realmOrOptions;
    const params: Record<string, string | number> = {};
    if (opts?.realm) params.realm = opts.realm;
    if (opts && 'type' in opts && (opts as { type?: string }).type)
      params.type = (opts as { type?: string }).type as string;
    if (opts && 'season' in opts && (opts as { season?: string }).season)
      params.season = (opts as { season?: string }).season as string;
    if (
      opts &&
      'limit' in opts &&
      (opts as { limit?: number }).limit !== undefined
    )
      params.limit = (opts as { limit?: number }).limit as number;
    if (
      opts &&
      'offset' in opts &&
      (opts as { offset?: number }).offset !== undefined
    )
      params.offset = (opts as { offset?: number }).offset as number;

    const response = await this.client.get<{ leagues: League[] }>('/league', {
      params,
    });
    return response.data;
  }

  /**
   * Get a specific league by id.
   * @see https://www.pathofexile.com/developer/docs/reference#leagues-get
   */
  async getLeague(
    leagueId: string,
    realm?: Realm
  ): Promise<{ league: League | null }> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<{ league: League | null }>(
      `/league/${leagueId}`,
      {
        params,
      }
    );
    return response.data;
  }

  /**
   * Get league ladder (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#leagues-ladder
   */
  async getLeagueLadder(
    leagueId: string,
    options?: {
      realm?: Exclude<Realm, 'poe2'>;
      offset?: number;
      limit?: number;
      sort?:
        | 'xp'
        | 'depth'
        | 'depthsolo'
        | 'ancestor'
        | 'time'
        | 'score'
        | 'class';
      class?:
        | 'scion'
        | 'marauder'
        | 'ranger'
        | 'witch'
        | 'duelist'
        | 'templar'
        | 'shadow';
    }
  ): Promise<{ league: League; ladder: Ladder }> {
    const params: Record<string, string | number> = {};
    if (options?.realm) params.realm = options.realm;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.sort) params.sort = options.sort;
    if (options?.class && options.sort === 'class')
      params.class = options.class;

    const response = await this.client.get(`/league/${leagueId}/ladder`, {
      params,
    });
    return response.data;
  }

  // League Event Ladder (PoE1 only)
  /**
   * Get league event ladder (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#leagues-event-ladder
   */
  async getLeagueEventLadder(
    leagueId: string,
    options?: {
      realm?: Exclude<Realm, 'poe2'>;
      offset?: number;
      limit?: number;
    }
  ): Promise<{
    league: League;
    ladder: { total: number; entries: EventLadderEntry[] };
  }> {
    const params: Record<string, string | number> = {};
    if (options?.realm) params.realm = options.realm;
    if (options?.offset !== undefined) params.offset = options.offset;
    if (options?.limit !== undefined) params.limit = options.limit;

    const response = await this.client.get(`/league/${leagueId}/event-ladder`, {
      params,
    });
    return response.data;
  }

  // Character endpoints
  /**
   * List account characters.
   * @see https://www.pathofexile.com/developer/docs/reference#characters-list
   */
  async getCharacters(realm?: Realm): Promise<{ characters: Character[] }> {
    const url = realm ? `/character/${realm}` : '/character';
    const response = await this.client.get<{ characters: Character[] }>(url);
    return response.data;
  }

  /**
   * Get a character by name with equipment, inventory, and passives.
   * @see https://www.pathofexile.com/developer/docs/reference#characters-get
   */
  async getCharacter(
    name: string,
    realm?: Realm
  ): Promise<{ character: Character | null }> {
    const url = realm ? `/character/${realm}/${name}` : `/character/${name}`;
    const response = await this.client.get<{ character: Character | null }>(
      url
    );
    return response.data;
  }

  // Stash endpoints (PoE1 only)
  /**
   * List account stash tabs for a league (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#stashes-list
   */
  async getStashes(
    league: string,
    realm?: Exclude<Realm, 'poe2'>
  ): Promise<{ stashes: StashTab[] }> {
    const url = realm ? `/stash/${realm}/${league}` : `/stash/${league}`;
    const response = await this.client.get<{ stashes: StashTab[] }>(url);
    return response.data;
  }

  /**
   * Get a specific stash or substash (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#stashes-get
   */
  async getStash(
    league: string,
    stashId: string,
    substashId?: string,
    realm?: Realm
  ): Promise<{ stash: StashTab | null }> {
    const baseUrl = realm ? `/stash/${realm}/${league}` : `/stash/${league}`;
    const url = substashId
      ? `${baseUrl}/${stashId}/${substashId}`
      : `${baseUrl}/${stashId}`;
    const response = await this.client.get<{ stash: StashTab | null }>(url);
    return response.data;
  }

  // League account endpoints (PoE1 only)
  /**
   * Get league account info such as atlas passives (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#leagueaccounts
   */
  async getLeagueAccount(
    league: string,
    realm?: Realm
  ): Promise<{ league_account: LeagueAccount }> {
    const url = realm
      ? `/league-account/${realm}/${league}`
      : `/league-account/${league}`;
    const response = await this.client.get<{ league_account: LeagueAccount }>(
      url
    );
    return response.data;
  }

  // PvP Match endpoints (PoE1 only)
  /**
   * List PvP matches (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#matches-list
   */
  async getPvpMatches(
    realmOrOptions?:
      | Realm
      | {
          realm?: Exclude<Realm, 'poe2'>;
          type?: 'upcoming' | 'season' | 'league';
          season?: string;
          league?: string;
        }
  ): Promise<{ matches: PvpMatch[] }> {
    const opts =
      typeof realmOrOptions === 'string' || realmOrOptions === undefined
        ? { realm: realmOrOptions as Realm | undefined }
        : realmOrOptions;

    const params: Record<string, string | number> = {};
    if (opts?.realm) params.realm = opts.realm;
    if (opts && 'type' in opts && (opts as { type?: string }).type)
      params.type = (opts as { type?: string }).type as string;
    if (opts && 'season' in opts && (opts as { season?: string }).season)
      params.season = (opts as { season?: string }).season as string;
    if (opts && 'league' in opts && (opts as { league?: string }).league)
      params.league = (opts as { league?: string }).league as string;

    const response = await this.client.get<{ matches: PvpMatch[] }>(
      '/pvp-match',
      { params }
    );
    return response.data;
  }

  /**
   * Get a PvP match by id (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#matches-get
   */
  async getPvpMatch(
    matchId: string,
    realm?: Realm
  ): Promise<{ match: PvpMatch | null }> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<{ match: PvpMatch | null }>(
      `/pvp-match/${matchId}`,
      {
        params,
      }
    );
    return response.data;
  }

  // PvP Match Ladder (PoE1 only)
  /**
   * Get PvP match ladder (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#matches-ladder
   */
  async getPvpMatchLadder(
    matchId: string,
    options?: {
      realm?: Exclude<Realm, 'poe2'>;
      limit?: number;
      offset?: number;
    }
  ): Promise<{
    match: PvpMatch;
    ladder: { total: number; entries: PvPLadderTeamEntry[] };
  }> {
    const params: Record<string, string | number> = {};
    if (options?.realm) params.realm = options.realm;
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;

    const response = await this.client.get(`/pvp-match/${matchId}/ladder`, {
      params,
    });
    return response.data;
  }

  // Public Stash API (PoE1 only)
  /**
   * Get public stashes stream page (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#publicstashes-list
   */
  async getPublicStashes(options?: {
    realm?: Realm;
    id?: string;
  }): Promise<import('../types').PublicStashesResponse> {
    const url = options?.realm
      ? `/public-stash-tabs/${options.realm}`
      : '/public-stash-tabs';
    const params = options?.id ? { id: options.id } : {};
    const response = await this.client.get<
      import('../types').PublicStashesResponse
    >(url, { params });
    return response.data;
  }

  // Currency Exchange API
  /**
   * Get currency exchange markets history.
   * @see https://www.pathofexile.com/developer/docs/reference#currencyexchange-list
   */
  async getCurrencyExchange(
    realm?: Exclude<Realm, 'pc'> | 'poe2',
    id?: string
  ): Promise<import('../types').CurrencyExchangeResponse> {
    let url = '/currency-exchange';
    if (realm) url += `/${realm}`;
    if (id) url += `/${id}`;

    const response =
      await this.client.get<import('../types').CurrencyExchangeResponse>(url);
    return response.data;
  }

  // Item Filter endpoints
  /**
   * List item filters on the account.
   * @see https://www.pathofexile.com/developer/docs/reference#itemfilters-list
   */
  async getItemFilters(): Promise<{
    filters: import('../types').ItemFilter[];
  }> {
    const response = await this.client.get<{
      filters: import('../types').ItemFilter[];
    }>('/item-filter');
    return response.data;
  }

  /**
   * Get an item filter by id.
   * @see https://www.pathofexile.com/developer/docs/reference#itemfilters-get
   */
  async getItemFilter(
    filterId: string
  ): Promise<{ filter: import('../types').ItemFilter }> {
    const response = await this.client.get<{
      filter: import('../types').ItemFilter;
    }>(`/item-filter/${filterId}`);
    return response.data;
  }

  /**
   * Create an item filter. Optionally validate against current game version.
   * @see https://www.pathofexile.com/developer/docs/reference#itemfilters-post
   */
  async createItemFilter(
    filter: Partial<import('../types').ItemFilter> & {
      filter_name: string;
      realm: string;
      filter: string;
    },
    options?: { validate?: boolean }
  ): Promise<{ filter: import('../types').ItemFilter }> {
    const response = await this.client.post<{
      filter: import('../types').ItemFilter;
    }>('/item-filter', filter, {
      params: options?.validate ? { validate: true } : {},
    });
    return response.data;
  }

  /**
   * Update an item filter (partial). Optionally validate.
   * @see https://www.pathofexile.com/developer/docs/reference#itemfilters-patch
   */
  async updateItemFilter(
    filterId: string,
    patch: Partial<import('../types').ItemFilter>,
    options?: { validate?: boolean }
  ): Promise<{ filter: import('../types').ItemFilter }> {
    const response = await this.client.post<{
      filter: import('../types').ItemFilter;
    }>(`/item-filter/${filterId}`, patch, {
      params: options?.validate ? { validate: true } : {},
    });
    return response.data;
  }

  // Account Leagues (PoE1 only)
  /**
   * Get account leagues including private (PoE1 only).
   * @see https://www.pathofexile.com/developer/docs/reference#accountleagues-list
   */
  async getAccountLeagues(
    realm?: Exclude<Realm, 'poe2'>
  ): Promise<{ leagues: League[] }> {
    const params = realm ? { realm } : {};
    const response = await this.client.get<{ leagues: League[] }>(
      '/account/leagues',
      { params }
    );
    return response.data;
  }

  // Guild Stashes (PoE1 only)
  /**
   * List guild stash tabs for a league (PoE1 only; special scope required).
   * @see https://www.pathofexile.com/developer/docs/reference#guildstashes-list
   */
  async getGuildStashes(
    league: string,
    realm?: Exclude<Realm, 'poe2'>
  ): Promise<{ stashes: StashTab[] }> {
    const url = realm
      ? `/guild/${realm}/stash/${league}`
      : `/guild/stash/${league}`;
    const response = await this.client.get<{ stashes: StashTab[] }>(url);
    return response.data;
  }

  /**
   * Get a guild stash or substash (PoE1 only; special scope required).
   * @see https://www.pathofexile.com/developer/docs/reference#guildstashes-get
   */
  async getGuildStash(
    league: string,
    stashId: string,
    substashId?: string,
    realm?: Exclude<Realm, 'poe2'>
  ): Promise<{ stash: StashTab | null }> {
    const baseUrl = realm
      ? `/guild/${realm}/stash/${league}`
      : `/guild/stash/${league}`;
    const url = substashId
      ? `${baseUrl}/${stashId}/${substashId}`
      : `${baseUrl}/${stashId}`;
    const response = await this.client.get<{ stash: StashTab | null }>(url);
    return response.data;
  }
}
