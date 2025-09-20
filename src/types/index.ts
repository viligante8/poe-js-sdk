export type Realm = 'pc' | 'xbox' | 'sony' | 'poe2';

export interface Profile {
  uuid: string;
  name: string;
  locale?: string;
  realm?: Realm;
  guild?: {
    name: string;
    tag?: string;
  };
  twitch?: {
    name: string;
  };
}

/**
 * League metadata returned by league endpoints.
 * @see https://www.pathofexile.com/developer/docs/reference#type-League
 */
export interface League {
  id: string;
  realm: Realm;
  description?: string;
  category?: {
    id: string;
    current?: boolean;
  };
  rules?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  registerAt?: string;
  event?: boolean;
  url?: string;
  startAt?: string;
  endAt?: string;
  timedEvent?: boolean;
  scoreEvent?: boolean;
  delveEvent?: boolean;
  ancestorEvent?: boolean;
  leagueEvent?: boolean;
}

/**
 * Account character object including equipment/inventory/passives.
 * @see https://www.pathofexile.com/developer/docs/reference#characters-list
 */
export interface Character {
  id: string;
  name: string;
  realm: Realm;
  class: string;
  league: string;
  level: number;
  experience: number;
  current?: boolean;
  equipment?: Item[];
  inventory?: Item[];
  rucksack?: Item[];
  skills?: Skill[];
  passives?: {
    hashes: number[];
    specialisations?: {
      set1?: number[];
      set2?: number[];
      set3?: number[];
    };
  };
}

/**
 * Item representation used across inventory/stash/public stashes.
 * This is a large shape; consult the official docs for field details.
 * @see https://www.pathofexile.com/developer/docs/reference#type-Item
 */
export interface Item {
  verified: boolean;
  w: number;
  h: number;
  icon: string;
  league?: string;
  id?: string;
  name?: string;
  typeLine: string;
  baseType: string;
  rarity?: number;
  identified: boolean;
  itemLevel?: number;
  ilvl: number;
  note?: string;
  forum_note?: string;
  lockedToCharacter?: boolean;
  lockedToAccount?: boolean;
  duplicated?: boolean;
  split?: boolean;
  corrupted?: boolean;
  unmodifiable?: boolean;
  cisRaceReward?: boolean;
  seaRaceReward?: boolean;
  thRaceReward?: boolean;
  properties?: Property[];
  notableProperties?: Property[];
  requirements?: Property[];
  additionalProperties?: Property[];
  nextLevelRequirements?: Property[];
  talismanTier?: number;
  rewards?: Property[];
  secDescrText?: string;
  descrText?: string;
  flavourText?: string[];
  flavourTextNote?: string;
  prophecyText?: string;
  isRelic?: boolean;
  foilVariation?: number;
  replica?: boolean;
  foreseeing?: boolean;
  incubatedItem?: {
    name: string;
    level: number;
    progress: number;
    total: number;
  };
  scourged?: {
    tier?: number;
    level?: number;
    progress?: number;
    total?: number;
  };
  crucible?: {
    layout?: string;
    nodes?: Record<string, unknown>;
  };
  ruthless?: boolean;
  frameType?: number;
  artFilename?: string;
  hybrid?: {
    isVaalGem?: boolean;
    baseTypeName: string;
    properties?: Property[];
    explicitMods?: string[];
    secDescrText: string;
  };
  extended?: {
    category?: string;
    subcategories?: string[];
    prefixes?: number;
    suffixes?: number;
  };
  x?: number;
  y?: number;
  inventoryId?: string;
  socketedItems?: Item[];
  sockets?: Socket[];
  gemSockets?: string[];
  colour?: string;
  implicitMods?: string[];
  utilityMods?: string[];
  explicitMods?: string[];
  craftedMods?: string[];
  enchantMods?: string[];
  fracturedMods?: string[];
  cosmeticMods?: string[];
  veiledMods?: string[];
  veiled?: boolean;
  abyssJewel?: boolean;
  delve?: boolean;
  fractured?: boolean;
  synthesised?: boolean;
  searing?: boolean;
  tangled?: boolean;
  influences?: Record<string, boolean>;
  elder?: boolean;
  shaper?: boolean;
  isVeiled?: boolean;
  elder_item?: boolean;
  shaper_item?: boolean;
  fractured_item?: boolean;
  synthesised_item?: boolean;
  searing_item?: boolean;
  tangled_item?: boolean;
  foil_variation?: number;
  sanctified?: boolean;
  desecrated?: boolean;
  desecratedMods?: string[];
  iconTierText?: string;
}

export interface Property {
  name: string;
  values: Array<[string, number]>;
  displayMode?: number;
  progress?: number;
  type?: number;
  suffix?: string;
}

export interface Socket {
  group: number;
  attr: string;
  sColour: string;
}

export interface Skill {
  id: string;
  slot: string;
  colour: string;
  spellbook?: boolean;
  gemSockets?: string[];
  socketedItems?: Item[];
}

/**
 * Stash tab node; may contain children and items depending on context.
 * @see https://www.pathofexile.com/developer/docs/reference#stashes-list
 */
export interface StashTab {
  id: string;
  parent?: string;
  name: string;
  type: string;
  index?: number;
  metadata?: {
    public?: boolean;
    folder?: boolean;
    colour?: string;
  };
  children?: StashTab[];
  items?: Item[];
}

export interface PvpMatch {
  id: string;
  realm: Realm;
  startAt?: string;
  endAt?: string;
  url?: string;
  description?: string;
  glickoRatings: boolean;
  pvp: boolean;
  style: string;
  registerAt?: string;
  complete?: boolean;
  upcoming?: boolean;
  inProgress?: boolean;
}

export interface LeagueAccount {
  atlas_passives?: {
    hashes: number[];
  };
}

// Ladder types (PoE1 only for league ladders)
/**
 * League ladder summary and entries (PoE1 only).
 * @see https://www.pathofexile.com/developer/docs/reference#leagues-ladder
 */
export interface Ladder {
  total: number;
  cached_since?: string; // ISO8601
  entries: LadderEntry[];
}

/**
 * Ladder entry for league ladders (PoE1 only).
 * @see https://www.pathofexile.com/developer/docs/reference#leagues-ladder
 */
export interface LadderEntry {
  rank: number;
  dead?: boolean;
  online?: boolean;
  character: {
    name: string;
    level: number;
    class: string;
    experience?: number;
    id?: string;
    league?: string;
  };
  account?: {
    name: string;
    challenges?: { total: number };
  };
  time?: string; // ISO8601 for race/event ladders
  score?: number;
  depth?: { default?: number; solo?: number };
}

/**
 * Ladder entry for event ladders (PoE1 only).
 * @see https://www.pathofexile.com/developer/docs/reference#leagues-event-ladder
 */
export interface EventLadderEntry {
  rank: number;
  account: { name: string };
  character?: { name: string; class: string; level: number };
  time?: number; // seconds
  score?: number;
}

/**
 * PvP ladder team entry (PoE1 only).
 * @see https://www.pathofexile.com/developer/docs/reference#matches-ladder
 */
export interface PvPLadderTeamEntry {
  rank: number;
  rating?: number;
  wins?: number;
  losses?: number;
  team: Array<{
    account: { name: string };
    character?: { name: string; class?: string; level?: number };
  }>;
}

export interface ApiError {
  error: {
    code: number;
    message: string;
  };
}

export interface RateLimitInfo {
  policy?: string;
  rules?: string;
  account?: string;
  ip?: string;
  client?: string;
  accountState?: string;
  ipState?: string;
  clientState?: string;
  retryAfter?: number;
}

// Item Filter
/**
 * Validation metadata for an item filter.
 * @see https://www.pathofexile.com/developer/docs/reference#itemfilters-post
 */
export type FilterType = 'Normal' | 'Ruthless';
export interface ItemFilterValidation {
  valid: boolean;
  version?: string; // game version
  validated?: string; // ISO8601
}
/**
 * Account item filter metadata and content.
 * Mirrors the official ItemFilter shape.
 * @see https://www.pathofexile.com/developer/docs/reference#type-ItemFilter
 */
export interface ItemFilter {
  id: string;
  filter_name: string;
  realm: Realm | 'poe2';
  description?: string;
  version?: string;
  type: FilterType;
  public?: boolean;
  filter?: string; // not present when listing all filters
  validation?: ItemFilterValidation; // not present when listing all filters
}

// Public Stash API
/**
 * A public stash change entry in the PSAPI stream (PoE1).
 * Optional fields can be null when a stash is unlisted.
 * @see https://www.pathofexile.com/developer/docs/reference#type-PublicStashChange
 */
export interface PublicStashChange {
  id: string; // 64 hex
  public: boolean;
  accountName?: string | null;
  stash?: string | null;
  stashType: string;
  league?: string | null;
  items: Item[];
}

export interface PublicStashesResponse {
  next_change_id: string;
  stashes: PublicStashChange[];
}

// Currency Exchange API
/**
 * Hourly market snapshot for a specific currency pair.
 * @see https://www.pathofexile.com/developer/docs/reference#currencyexchange-list
 */
export interface CurrencyMarketSnapshot {
  league: string;
  market_id: string; // e.g. chaos|divine
  volume_traded: Record<string, number>;
  lowest_stock: Record<string, number>;
  highest_stock: Record<string, number>;
  lowest_ratio: Record<string, number>;
  highest_ratio: Record<string, number>;
}

export interface CurrencyExchangeResponse {
  next_change_id: number; // unix timestamp truncated to hour
  markets: CurrencyMarketSnapshot[];
}

// Re-export trade types
export type {
  TradeSearchQuery,
  StatGroup,
  StatFilter,
  TradeSearchResponse,
  TradeFetchResponse,
  TradeItem,
} from './trade';
