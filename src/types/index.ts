export type Realm = 'pc' | 'xbox' | 'sony' | 'poe2';

export interface Profile {
  uuid: string;
  name: string;
  realm?: Realm;
  guild?: {
    name: string;
    tag?: string;
  };
  twitch?: {
    name: string;
  };
}

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
    nodes?: Record<string, any>;
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
  retryAfter?: number;
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
