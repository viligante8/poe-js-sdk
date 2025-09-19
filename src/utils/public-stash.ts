import type { PublicStashesResponse, Realm } from '../types';
import { PoEApiClient } from '../client/api-client';

export interface PublicStashStreamOptions {
  realm?: Exclude<Realm, 'pc'> | 'pc';
  startId?: string;
  idleWaitMs?: number; // wait when stashes are empty; default 2000
}

export async function* publicStashStream(
  client: PoEApiClient,
  options: PublicStashStreamOptions = {}
): AsyncGenerator<PublicStashesResponse, void> {
  let nextId = options.startId;
  const idle = options.idleWaitMs ?? 2000;
  while (true) {
    const params: { realm?: Realm; id?: string } = {} as any;
    if (options.realm !== undefined) params.realm = options.realm as Realm;
    if (nextId !== undefined) params.id = nextId;
    const res = await client.getPublicStashes(params);
    yield res;
    const sameId = res.next_change_id === nextId;
    nextId = res.next_change_id;
    if (res.stashes.length === 0 || sameId) {
      await new Promise((r) => setTimeout(r, idle));
    }
  }
}
