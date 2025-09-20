import { LadderPager } from './pagination';
import type { PoEApiClient } from '../client/api-client';

function makeEntry(rank: number): any {
  return {
    rank,
    character: { name: `c${rank}`, level: 90, class: 'Witch' },
  } as any;
}

describe('LadderPager', () => {
  const league = 'Affliction';

  it('loads first page and aggregates metadata', async () => {
    const getLeagueLadder = jest.fn().mockResolvedValue({
      league: { id: league, realm: 'pc' },
      ladder: {
        total: 3,
        entries: [makeEntry(1), makeEntry(2)],
      },
    });

    const client = { getLeagueLadder } as unknown as PoEApiClient;
    const pager = new LadderPager(client, league, {
      realm: 'pc',
      sort: 'xp',
      limit: 2,
    });

    const first = await pager.loadFirst();
    expect(first?.total).toBe(3);
    expect(pager.entries.length).toBe(2);
    expect(pager.total).toBe(3);
    // Called with the expected params, offset 0
    expect(getLeagueLadder).toHaveBeenCalledWith(league, {
      realm: 'pc',
      sort: 'xp',
      limit: 2,
      offset: 0,
    });
  });

  it('fetches next pages until empty and returns null when done', async () => {
    const getLeagueLadder = jest
      .fn()
      // first page 2 entries
      .mockResolvedValueOnce({
        league: { id: league, realm: 'pc' },
        ladder: { total: 5, entries: [makeEntry(1), makeEntry(2)] },
      })
      // second page 2 more
      .mockResolvedValueOnce({
        league: { id: league, realm: 'pc' },
        ladder: { total: 5, entries: [makeEntry(3), makeEntry(4)] },
      })
      // final page empty
      .mockResolvedValueOnce({
        league: { id: league, realm: 'pc' },
        ladder: { total: 5, entries: [] as any[] },
      });

    const client = { getLeagueLadder } as unknown as PoEApiClient;
    const pager = new LadderPager(client, league, { realm: 'pc', limit: 2 });

    await pager.loadFirst();
    const chunk1 = await pager.next();
    const chunk2 = await pager.next();

    expect(chunk1?.length).toBe(2);
    expect(chunk2).toBeUndefined();
    expect(pager.entries.map((entry) => entry.rank)).toEqual([1, 2, 3, 4]);
    // Offsets used: 0 (loadFirst), 2 (next), 4 (next)
    expect(getLeagueLadder.mock.calls[0][1]).toMatchObject({ offset: 0 });
    expect(getLeagueLadder.mock.calls[1][1]).toMatchObject({ offset: 2 });
    expect(getLeagueLadder.mock.calls[2][1]).toMatchObject({ offset: 4 });
  });

  it('marks ended immediately when first page is empty', async () => {
    const getLeagueLadder = jest.fn().mockResolvedValue({
      league: { id: league, realm: 'pc' },
      ladder: { total: 0, entries: [] as any[] },
    });

    const client = { getLeagueLadder } as unknown as PoEApiClient;
    const pager = new LadderPager(client, league, { realm: 'pc' });
    await pager.loadFirst();
    const next = await pager.next();
    expect(next).toBeUndefined();
    expect(pager.entries.length).toBe(0);
  });
});
