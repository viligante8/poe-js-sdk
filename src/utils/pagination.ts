import type { Ladder, LadderEntry, Realm } from '../types';
import { PoEApiClient } from '../client/api-client';

/** Options for {@link LadderPager}. */
export interface LadderPagerOptions {
  realm?: Exclude<Realm, 'poe2'>;
  sort?: 'xp' | 'depth' | 'depthsolo' | 'ancestor' | 'time' | 'score' | 'class';
  class?:
    | 'scion'
    | 'marauder'
    | 'ranger'
    | 'witch'
    | 'duelist'
    | 'templar'
    | 'shadow';
  limit?: number; // per page, max 500; defaults to 200
}

/**
 * Helper to paginate league ladders (PoE1) with simple `loadFirst()` and `next()` calls.
 * @see https://www.pathofexile.com/developer/docs/reference#leagues-ladder
 */
export class LadderPager {
  private client: PoEApiClient;
  private league: string;
  private options: LadderPagerOptions;
  private offset = 0;
  private ended = false;
  public entries: LadderEntry[] = [];
  public total = 0;

  /**
   * @param client PoE API client
   * @param league League id/name
   * @param options Ladder parameters (realm, sort/class, limit)
   */
  constructor(
    client: PoEApiClient,
    league: string,
    options: LadderPagerOptions = {}
  ) {
    this.client = client;
    this.league = league;
    this.options = { limit: 200, ...options };
  }

  /** Load the first ladder page, resetting state. */
  async loadFirst(): Promise<Ladder | null> {
    this.offset = 0;
    this.ended = false;
    const params: Record<string, string | number> = { offset: this.offset };
    if (this.options.realm !== undefined) params.realm = this.options.realm;
    if (this.options.sort !== undefined) params.sort = this.options.sort;
    if (this.options.class !== undefined) params.class = this.options.class;
    if (this.options.limit !== undefined) params.limit = this.options.limit;
    const res = await this.client.getLeagueLadder(this.league, params);
    this.entries = res.ladder.entries;
    this.total = res.ladder.total;
    this.offset = this.entries.length;
    if (this.entries.length === 0) this.ended = true;
    return res.ladder;
  }

  /** Fetch the next page of ladder entries, or null when no more. */
  async next(): Promise<LadderEntry[] | null> {
    if (this.ended) return null;
    const params: Record<string, string | number> = { offset: this.offset };
    if (this.options.realm !== undefined) params.realm = this.options.realm;
    if (this.options.sort !== undefined) params.sort = this.options.sort;
    if (this.options.class !== undefined) params.class = this.options.class;
    if (this.options.limit !== undefined) params.limit = this.options.limit;
    const res = await this.client.getLeagueLadder(this.league, params);
    const chunk = res.ladder.entries;
    if (!chunk || chunk.length === 0) {
      this.ended = true;
      return null;
    }
    this.entries.push(...chunk);
    this.total = res.ladder.total;
    this.offset += chunk.length;
    return chunk;
  }
}
