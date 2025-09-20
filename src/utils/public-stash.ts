import type { PublicStashesResponse, Realm } from '../types';
import { PoEApiClient } from '../client/api-client';

/** Options for {@link publicStashStream}. */
export interface PublicStashStreamOptions {
  realm?: Exclude<Realm, 'pc'> | 'pc';
  startId?: string;
  idleWaitMs?: number; // wait when stashes are empty; default 2000
}

/**
 * Async generator that yields from the Public Stash API stream (PoE1).
 * Waits briefly when the response is empty or `next_change_id` does not change.
 *
 * @param client PoE API client
 * @param options Stream options (realm, start id, idle wait)
 * @see https://www.pathofexile.com/developer/docs/reference#publicstashes-list
 */
export async function* publicStashStream(
  client: PoEApiClient,
  options: PublicStashStreamOptions = {}
): AsyncGenerator<PublicStashesResponse, void> {
  let nextId = options.startId;
  const idle = options.idleWaitMs ?? 2000;
  while (true) {
    const parameters: { realm?: Realm; id?: string } = {};
    if (options.realm !== undefined) parameters.realm = options.realm as Realm;
    if (nextId !== undefined) parameters.id = nextId;
    const response = await client.getPublicStashes(parameters);
    yield response;
    const sameId = response.next_change_id === nextId;
    nextId = response.next_change_id;
    if (response.stashes.length === 0 || sameId) {
      await new Promise((r) => setTimeout(r, idle));
    }
  }
}
