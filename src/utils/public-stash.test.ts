import { publicStashStream } from './public-stash';
import type { PoEApiClient } from '../client/api-client';

describe('publicStashStream', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
    jest.resetAllMocks();
  });

  it('yields chunks and propagates next_change_id with realm param', async () => {
    const getPublicStashes = jest
      .fn()
      .mockResolvedValueOnce({ next_change_id: '1', stashes: [{ id: 'a' }] })
      .mockResolvedValueOnce({ next_change_id: '2', stashes: [{ id: 'b' }] });

    const client = { getPublicStashes } as unknown as PoEApiClient;

    const gen = publicStashStream(client, { realm: 'pc', idleWaitMs: 200 });

    const r1 = await gen.next();
    expect(r1.done).toBe(false);
    expect((r1.value as any).next_change_id).toBe('1');
    // First call has no id
    expect(getPublicStashes).toHaveBeenNthCalledWith(1, { realm: 'pc' });

    const r2 = await gen.next();
    expect(r2.done).toBe(false);
    expect((r2.value as any).next_change_id).toBe('2');
    // Second call uses previous id
    expect(getPublicStashes).toHaveBeenNthCalledWith(2, { realm: 'pc', id: '1' });
  });

  it('waits when chunk is empty', async () => {
    const getPublicStashes = jest
      .fn()
      .mockResolvedValueOnce({ next_change_id: 'A', stashes: [] })
      .mockResolvedValueOnce({ next_change_id: 'B', stashes: [{ id: 'x' }] });

    const client = { getPublicStashes } as unknown as PoEApiClient;
    const gen = publicStashStream(client, { realm: 'pc', idleWaitMs: 200 });

    const r1 = await gen.next();
    expect(r1.done).toBe(false);
    expect((r1.value as any).next_change_id).toBe('A');

    const p2 = gen.next();
    let resolved = false;
    p2.then(() => (resolved = true));
    expect(resolved).toBe(false);

    await jest.advanceTimersByTimeAsync(200);
    const r2 = await p2;
    expect(r2.done).toBe(false);
    expect((r2.value as any).next_change_id).toBe('B');
    expect(getPublicStashes).toHaveBeenNthCalledWith(2, { realm: 'pc', id: 'A' });
  });

  it('waits when next_change_id does not change', async () => {
    const getPublicStashes = jest
      .fn()
      .mockResolvedValueOnce({ next_change_id: 'X', stashes: [{ id: '1' }] })
      .mockResolvedValueOnce({ next_change_id: 'X', stashes: [{ id: '2' }] })
      .mockResolvedValueOnce({ next_change_id: 'Y', stashes: [{ id: '3' }] });

    const client = { getPublicStashes } as unknown as PoEApiClient;
    const gen = publicStashStream(client, { realm: 'pc', idleWaitMs: 300 });

    const r1 = await gen.next();
    expect(r1.done).toBe(false);
    expect((r1.value as any).next_change_id).toBe('X');

    const r2 = await gen.next();
    expect(r2.done).toBe(false);
    expect((r2.value as any).next_change_id).toBe('X'); // same id yields, then waits

    const p3 = gen.next();
    let resolved = false;
    p3.then(() => (resolved = true));
    expect(resolved).toBe(false);
    await jest.advanceTimersByTimeAsync(300);
    const r3 = await p3;
    expect(r3.done).toBe(false);
    expect((r3.value as any).next_change_id).toBe('Y');
    expect(getPublicStashes).toHaveBeenNthCalledWith(3, { realm: 'pc', id: 'X' });
  });
});
