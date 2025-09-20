import {
  groupTradeResults,
  AdvancedTradeQueryBuilder,
  TradeRateLimiter,
} from './trade-enhancements';

function makeItem(account: string, amount: number, currency = 'chaos'): any {
  return {
    id: Math.random().toString(36).slice(2),
    listing: { account: { name: account }, price: { amount, currency } },
    item: { name: 'Test' },
  } as any;
}

describe('groupTradeResults', () => {
  it('groups items by same account and same price', () => {
    const a = makeItem('acc1', 10);
    const b = makeItem('acc1', 10);
    const grouped = groupTradeResults([a, b]);
    expect(grouped).toHaveLength(1);
    const g0 = grouped[0]!;
    expect(g0.listedTimes).toBe(2);
    expect(g0.priceRange).toEqual({ min: 10, max: 10 });
    expect(g0.averagePrice).toBe(10);
  });

  it('updates price range when grouped entries differ in price', () => {
    const a = makeItem('acc1', 10);
    const b = makeItem('acc1', 15);
    // Using recent-listing rule groups b into a
    const grouped = groupTradeResults([a, b]);
    expect(grouped).toHaveLength(1);
    const g0 = grouped[0]!;
    expect(g0.listedTimes).toBe(2);
    expect(g0.priceRange).toEqual({ min: 10, max: 15 });
    expect(g0.averagePrice).toBe(12.5);
  });
});

describe('AdvancedTradeQueryBuilder', () => {
  it('builds misc filters for item/gem/quality/corrupted and influenced flags', () => {
    const q = new AdvancedTradeQueryBuilder()
      .itemLevel(70)
      .gemLevel(18)
      .quality(15)
      .corrupted(false)
      .influenced(['shaper', 'elder'])
      .build();

    const misc = q.query.filters?.misc_filters?.filters as any;
    expect(misc).toBeDefined();
    expect(misc.ilvl).toEqual({ min: 70 });
    expect(misc.gem_level).toEqual({ min: 18 });
    expect(misc.quality).toEqual({ min: 15 });
    expect(misc.corrupted).toEqual({ option: 'false' });
    expect(misc.shaper).toEqual({ option: 'true' });
    expect(misc.elder).toEqual({ option: 'true' });
  });

  it('adds DPS pseudo stats via weaponDPS helper', () => {
    const q = new AdvancedTradeQueryBuilder().weaponDPS(150, 200, 300).build();
    // Expect one stats group added with three entries
    expect(q.query.stats?.length).toBeGreaterThan(0);
    const group = q.query.stats![0] as any;
    expect(group.filters.length).toBe(3);
    // focus on min values rather than IDs (avoid coupling)
    const mins = (
      group.filters.map((f: any) => f.value?.min) as number[]
    ).toSorted((a, b) => a - b);
    expect(mins).toEqual([150, 200, 300]);
  });
});

describe('TradeRateLimiter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('limits requests within the window and recovers after window elapses', () => {
    const limiter = new TradeRateLimiter();

    // For 'search': 5 per 5s
    for (let index = 0; index < 5; index++) {
      expect(limiter.canMakeRequest('search')).toBe(true);
      limiter.recordRequest('search');
    }
    expect(limiter.canMakeRequest('search')).toBe(false);
    const wait = limiter.getWaitTime('search');
    expect(wait).toBeGreaterThan(0);

    // Advance time past the window
    const now = Date.now();
    jest.setSystemTime(new Date(now + 5001));
    expect(limiter.canMakeRequest('search')).toBe(true);
  });
});
