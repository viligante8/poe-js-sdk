import axios, { AxiosInstance } from 'axios';
import type {
  TradeSearchQuery,
  TradeSearchResponse,
  TradeFetchResponse,
  Realm,
} from '../types';

export interface TradeClientConfig {
  poesessid: string;
  userAgent?: string;
  baseURL?: string;
}

/**
 * UNOFFICIAL Trade API Client
 * 
 * WARNING: This uses unofficial trade endpoints that are not part of the official PoE API.
 * These endpoints may change or break without notice. Use at your own risk.
 * 
 * Requires a valid POESESSID cookie from your browser session.
 */
export class TradeClient {
  private client: AxiosInstance;

  constructor(config: TradeClientConfig) {
    this.client = axios.create({
      baseURL: config.baseURL || 'https://www.pathofexile.com/api/trade2',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': config.userAgent || 'PoE-SDK/1.0.0',
        'Cookie': `POESESSID=${config.poesessid}`,
        'Accept': '*/*',
        'Connection': 'keep-alive',
      },
    });
  }

  /**
   * Search for items using trade search query
   * @param league League name (e.g., 'Standard', 'Hardcore')
   * @param query Trade search query
   * @param realm Realm ('pc', 'xbox', 'sony', 'poe2')
   */
  async search(
    league: string,
    query: TradeSearchQuery,
    realm: Realm = 'pc'
  ): Promise<TradeSearchResponse> {
    const url = `/search/${realm}/${league}`;
    const response = await this.client.post<TradeSearchResponse>(url, query);
    return response.data;
  }

  /**
   * Fetch item details by result IDs
   * @param resultIds Array of result IDs from search response
   * @param queryId Query ID from search response
   * @param realm Realm ('pc', 'xbox', 'sony', 'poe2')
   */
  async fetch(
    resultIds: string[],
    queryId: string,
    realm: Realm = 'pc'
  ): Promise<TradeFetchResponse> {
    const ids = resultIds.slice(0, 10).join(','); // Limit to 10 items
    const url = `/fetch/${ids}?query=${queryId}`;
    const response = await this.client.get<TradeFetchResponse>(url);
    return response.data;
  }

  /**
   * Search and fetch items in one call
   * @param league League name
   * @param query Trade search query
   * @param limit Maximum number of items to fetch (default: 10)
   * @param realm Realm ('pc', 'xbox', 'sony', 'poe2')
   */
  async searchAndFetch(
    league: string,
    query: TradeSearchQuery,
    limit: number = 10,
    realm: Realm = 'pc'
  ): Promise<{ search: TradeSearchResponse; items: TradeFetchResponse }> {
    const searchResult = await this.search(league, query, realm);
    
    if (searchResult.result.length === 0) {
      return {
        search: searchResult,
        items: { result: [] },
      };
    }

    const itemsResult = await this.fetch(
      searchResult.result.slice(0, limit),
      searchResult.id,
      realm
    );

    return {
      search: searchResult,
      items: itemsResult,
    };
  }

  /**
   * Get whisper message for an item
   * @param itemId Item ID
   * @param queryId Query ID
   * @param realm Realm ('pc', 'xbox', 'sony', 'poe2')
   */
  async getWhisper(
    itemId: string,
    queryId: string,
    realm: Realm = 'pc'
  ): Promise<{ whisper: string }> {
    const url = `/whisper/${itemId}?query=${queryId}`;
    const response = await this.client.get<{ whisper: string }>(url);
    return response.data;
  }
}
