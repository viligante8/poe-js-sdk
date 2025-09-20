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
  async loadFirst(): Promise<Ladder> {
    this.offset = 0;
    this.ended = false;
    const parameters: Record<string, string | number> = { offset: this.offset };
    if (this.options.realm !== undefined) parameters.realm = this.options.realm;
    if (this.options.sort !== undefined) parameters.sort = this.options.sort;
    if (this.options.class !== undefined) parameters.class = this.options.class;
    if (this.options.limit !== undefined) parameters.limit = this.options.limit;
    const response = await this.client.getLeagueLadder(this.league, parameters);
    this.entries = response.ladder.entries;
    this.total = response.ladder.total;
    this.offset = this.entries.length;
    if (this.entries.length === 0) this.ended = true;
    return response.ladder;
  }

  /** Fetch the next page of ladder entries, or undefined when no more. */
  async next(): Promise<LadderEntry[] | undefined> {
    if (this.ended) return undefined;
    const parameters: Record<string, string | number> = { offset: this.offset };
    if (this.options.realm !== undefined) parameters.realm = this.options.realm;
    if (this.options.sort !== undefined) parameters.sort = this.options.sort;
    if (this.options.class !== undefined) parameters.class = this.options.class;
    if (this.options.limit !== undefined) parameters.limit = this.options.limit;
    const response = await this.client.getLeagueLadder(this.league, parameters);
    const chunk = response.ladder.entries;
    if (!chunk || chunk.length === 0) {
      this.ended = true;
      return undefined;
    }
    this.entries.push(...chunk);
    this.total = response.ladder.total;
    this.offset += chunk.length;
    return chunk;
  }
}
