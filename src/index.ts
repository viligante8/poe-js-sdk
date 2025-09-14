export { PoEApiClient } from './client/api-client';
export { TradeClient } from './client/trade-client';
export { OAuthHelper } from './auth/oauth';
export { TradeQueryBuilder, ItemCategories, Currencies } from './utils/trade-query-builder';
export { 
  AdvancedTradeQueryBuilder, 
  TradeRateLimiter,
  groupTradeResults,
  ENHANCED_CATEGORIES,
  ENHANCED_CURRENCIES,
  COMMON_STAT_IDS
} from './utils/trade-enhancements';
export type { OAuthConfig, TokenResponse, PKCEParams } from './auth/oauth';
export type { ClientConfig } from './client/api-client';
export type { TradeClientConfig } from './client/trade-client';
export type { GroupedTradeResult } from './utils/trade-enhancements';
export type {
  Profile,
  League,
  Character,
  Item,
  Property,
  Socket,
  Skill,
  StashTab,
  PvpMatch,
  LeagueAccount,
  ApiError,
  RateLimitInfo,
  Realm,
  TradeSearchQuery,
  StatGroup,
  StatFilter,
  TradeSearchResponse,
  TradeFetchResponse,
  TradeItem,
} from './types';
