import axios from 'axios';
import { TradeClient } from '../client/trade-client';
import { TradeQueryBuilder, ItemCategories, Currencies } from '../utils/trade-query-builder';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TradeClient', () => {
  let client: TradeClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    client = new TradeClient({
      poesessid: 'test-session-id',
      userAgent: 'TestApp/1.0.0',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('constructor', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://www.pathofexile.com/api/trade2',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'TestApp/1.0.0',
          'Cookie': 'POESESSID=test-session-id',
          'Accept': '*/*',
          'Connection': 'keep-alive',
        },
      });
    });
  });

  describe('search', () => {
    it('should search for items', async () => {
      const mockResponse = {
        id: 'test-query-id',
        complexity: 5,
        result: ['item1', 'item2', 'item3'],
        total: 100,
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const query = new TradeQueryBuilder()
        .category(ItemCategories.ACCESSORY_RING)
        .build();

      const result = await client.search('Standard', query);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search/pc/Standard', query);
      expect(result).toEqual(mockResponse);
    });

    it('should search with different realm', async () => {
      const mockResponse = { id: 'test', complexity: 1, result: [], total: 0 };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockResponse });

      const query = new TradeQueryBuilder().build();
      await client.search('Standard', query, 'poe2');

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/search/poe2/Standard', query);
    });
  });

  describe('fetch', () => {
    it('should fetch item details', async () => {
      const mockResponse = {
        result: [
          {
            id: 'item1',
            listing: { price: { amount: 10, currency: 'chaos' } },
            item: { name: 'Test Item' },
          },
        ],
      };

      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const result = await client.fetch(['item1', 'item2'], 'query-id');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/fetch/item1,item2?query=query-id');
      expect(result).toEqual(mockResponse);
    });

    it('should limit to 10 items', async () => {
      const mockResponse = { result: [] };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockResponse });

      const manyIds = Array.from({ length: 15 }, (_, i) => `item${i}`);
      await client.fetch(manyIds, 'query-id');

      const expectedIds = manyIds.slice(0, 10).join(',');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/fetch/${expectedIds}?query=query-id`);
    });
  });

  describe('searchAndFetch', () => {
    it('should search and fetch in one call', async () => {
      const searchResponse = {
        id: 'query-id',
        complexity: 5,
        result: ['item1', 'item2'],
        total: 50,
      };

      const fetchResponse = {
        result: [
          { id: 'item1', listing: {}, item: {} },
          { id: 'item2', listing: {}, item: {} },
        ],
      };

      mockAxiosInstance.post.mockResolvedValueOnce({ data: searchResponse });
      mockAxiosInstance.get.mockResolvedValueOnce({ data: fetchResponse });

      const query = new TradeQueryBuilder().build();
      const result = await client.searchAndFetch('Standard', query, 5);

      expect(result.search).toEqual(searchResponse);
      expect(result.items).toEqual(fetchResponse);
    });

    it('should handle empty search results', async () => {
      const searchResponse = { id: 'query-id', complexity: 1, result: [], total: 0 };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: searchResponse });

      const query = new TradeQueryBuilder().build();
      const result = await client.searchAndFetch('Standard', query);

      expect(result.search).toEqual(searchResponse);
      expect(result.items).toEqual({ result: [] });
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
    });
  });
});

describe('TradeQueryBuilder', () => {
  let builder: TradeQueryBuilder;

  beforeEach(() => {
    builder = new TradeQueryBuilder();
  });

  it('should build basic query', () => {
    const query = builder
      .onlineOnly(true)
      .category(ItemCategories.ACCESSORY_RING)
      .price(Currencies.CHAOS, 1, 100)
      .build();

    expect(query.query.status?.option).toBe('online');
    expect(query.query.filters?.type_filters?.filters.category?.option).toBe('accessory.ring');
    expect(query.query.filters?.trade_filters?.filters.price).toEqual({
      option: 'chaos',
      min: 1,
      max: 100,
    });
  });

  it('should add stat filters', () => {
    const query = builder
      .andStats([
        { id: 'stat1', min: 10 },
        { id: 'stat2', max: 50 },
      ])
      .orStats([{ id: 'stat3', min: 5, max: 15 }])
      .build();

    expect(query.query.stats).toHaveLength(2);
    expect(query.query.stats![0]?.type).toBe('and');
    expect(query.query.stats![1]?.type).toBe('or');
  });

  it('should reset builder', () => {
    const query1 = builder.category('weapon.sword').build();
    const query2 = builder.reset().category('armour.helmet').build();

    expect(query1.query.filters?.type_filters?.filters.category?.option).toBe('weapon.sword');
    expect(query2.query.filters?.type_filters?.filters.category?.option).toBe('armour.helmet');
  });
});
