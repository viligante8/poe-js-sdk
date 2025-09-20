export interface TradeSearchQuery {
  query: {
    stats?: StatGroup[];
    status?: {
      option: 'online' | 'any';
    };
    filters?: {
      type_filters?: {
        filters: {
          category?: {
            option: string;
          };
          rarity?: {
            option: string;
          };
        };
      };
      trade_filters?: {
        filters: {
          price?: {
            option: string;
            min?: number;
            max?: number;
          };
          account?: {
            input: string;
          };
        };
      };
      misc_filters?: {
        filters: Record<string, unknown>;
      };
    };
  };
}

export interface StatGroup {
  type: 'and' | 'or' | 'weight' | 'weight2';
  filters: StatFilter[];
}

export interface StatFilter {
  id: string;
  value: {
    min?: number;
    max?: number;
    weight?: number;
  };
  disabled: boolean;
}

export interface TradeSearchResponse {
  id: string;
  complexity: number;
  result: string[];
  total: number;
}

export interface TradeFetchResponse {
  result: TradeItem[];
}

export interface TradeItem {
  id: string;
  listing: {
    method: string;
    indexed: string;
    stash: {
      name: string;
      x: number;
      y: number;
    };
    whisper: string;
    account: {
      name: string;
      online?: {
        league: string;
      };
      lastCharacterName: string;
      language: string;
    };
    price: {
      type: string;
      amount: number;
      currency: string;
    };
  };
  item: {
    verified: boolean;
    w: number;
    h: number;
    icon: string;
    league: string;
    id: string;
    name: string;
    typeLine: string;
    baseType: string;
    rarity: number;
    identified: boolean;
    itemLevel: number;
    ilvl: number;
    properties?: Array<{
      name: string;
      values: Array<[string, number]>;
      displayMode: number;
    }>;
    requirements?: Array<{
      name: string;
      values: Array<[string, number]>;
      displayMode: number;
    }>;
    implicitMods?: string[];
    explicitMods?: string[];
    craftedMods?: string[];
    enchantMods?: string[];
    flavourText?: string[];
    frameType: number;
    extended: {
      category: string;
      subcategories: string[];
      prefixes: number;
      suffixes: number;
    };
  };
}
