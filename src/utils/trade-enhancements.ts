import type { TradeSearchQuery, TradeItem } from '../types';

// Enhanced category mappings from Exiled-Exchange-2
export const ENHANCED_CATEGORIES = {
  // PoE2 specific categories
  CROSSBOW: 'weapon.crossbow',
  FOCUS: 'armour.focus', 
  SPEAR: 'weapon.spear',
  FLAIL: 'weapon.flail',
  BUCKLER: 'armour.buckler',
  RUNE_DAGGER: 'weapon.runedagger',
  WARSTAFF: 'weapon.warstaff',
  
  // Enhanced PoE1 categories
  CLUSTER_JEWEL: 'jewel.cluster',
  ABYSS_JEWEL: 'jewel.abyss',
  HEIST_BLUEPRINT: 'heistmission.blueprint',
  HEIST_CONTRACT: 'heistmission.contract',
  HEIST_TOOL: 'heistequipment.heisttool',
  HEIST_BROOCH: 'heistequipment.heistreward',
  HEIST_GEAR: 'heistequipment.heistweapon',
  HEIST_CLOAK: 'heistequipment.heistutility',
  TRINKET: 'accessory.trinket',
  SANCTUM_RELIC: 'sanctum.relic',
  TINCTURE: 'tincture',
  CHARM: 'azmeri.charm',
} as const;

// Enhanced currency mappings from both tools
export const ENHANCED_CURRENCIES = {
  // PoE2 currencies
  GREATER_TRANSMUTE: 'greater-orb-of-transmutation',
  PERFECT_TRANSMUTE: 'perfect-orb-of-transmutation',
  GREATER_AUG: 'greater-orb-of-augmentation',
  PERFECT_AUG: 'perfect-orb-of-augmentation',
  GREATER_CHAOS: 'greater-chaos-orb',
  PERFECT_CHAOS: 'perfect-chaos-orb',
  
  // Standard currencies
  CHAOS: 'chaos',
  EXALTED: 'exalted',
  DIVINE: 'divine',
  MIRROR: 'mirror',
  ANCIENT: 'ancient',
  CHROMATIC: 'chromatic',
  JEWELLER: 'jeweller',
  FUSING: 'fusing',
  ALCHEMY: 'alchemy',
  CHISEL: 'chisel',
} as const;

// Common stat IDs from both tools
export const COMMON_STAT_IDS = {
  // Life and ES
  LIFE: 'explicit.stat_3299347043',
  ENERGY_SHIELD: 'explicit.stat_2901986750',
  MANA: 'explicit.stat_1050105434',
  
  // Resistances
  FIRE_RES: 'explicit.stat_4220027924',
  COLD_RES: 'explicit.stat_3441501978', 
  LIGHTNING_RES: 'explicit.stat_1671376347',
  CHAOS_RES: 'explicit.stat_2923486259',
  ALL_RES: 'explicit.stat_3372524247',
  
  // Damage
  ADDED_PHYS_DAMAGE: 'explicit.stat_1940865751',
  INCREASED_PHYS_DAMAGE: 'explicit.stat_1509134228',
  ADDED_FIRE_DAMAGE: 'explicit.stat_1334060246',
  ADDED_COLD_DAMAGE: 'explicit.stat_2387423236',
  ADDED_LIGHTNING_DAMAGE: 'explicit.stat_1754445556',
  
  // Attack/Cast Speed
  ATTACK_SPEED: 'explicit.stat_681332047',
  CAST_SPEED: 'explicit.stat_2891184298',
  
  // Critical
  CRIT_CHANCE: 'explicit.stat_587431675',
  CRIT_MULTI: 'explicit.stat_3556824919',
  
  // Movement
  MOVEMENT_SPEED: 'explicit.stat_2250533757',
} as const;

// Price grouping logic from Exiled-Exchange-2
export interface GroupedTradeResult extends TradeItem {
  listedTimes: number;
  averagePrice?: number;
  priceRange?: { min: number; max: number };
}

export function groupTradeResults(results: TradeItem[]): GroupedTradeResult[] {
  const grouped: GroupedTradeResult[] = [];
  
  for (const result of results) {
    if (!result) continue;
    
    if (grouped.length === 0) {
      grouped.push({ ...result, listedTimes: 1 });
      continue;
    }
    
    // Group by same account and similar price, or same account with recent listings
    const existing = grouped.find((added, idx) => 
      (added.listing.account.name === result.listing.account.name &&
       added.listing.price.currency === result.listing.price.currency &&
       added.listing.price.amount === result.listing.price.amount) ||
      (added.listing.account.name === result.listing.account.name && 
       grouped.length - idx <= 2) // Last or previous listing
    );
    
    if (existing) {
      existing.listedTimes += 1;
      // Calculate price range for grouped items
      if (!existing.priceRange) {
        existing.priceRange = { 
          min: existing.listing.price.amount, 
          max: existing.listing.price.amount 
        };
      }
      existing.priceRange.min = Math.min(existing.priceRange.min, result.listing.price.amount);
      existing.priceRange.max = Math.max(existing.priceRange.max, result.listing.price.amount);
      existing.averagePrice = (existing.priceRange.min + existing.priceRange.max) / 2;
    } else {
      grouped.push({ ...result, listedTimes: 1 });
    }
  }
  
  return grouped;
}

// Advanced search patterns from PathOfBuilding
export class AdvancedTradeQueryBuilder {
  private query: TradeSearchQuery = {
    query: {
      stats: [],
      status: { option: 'online' },
      filters: {},
    },
  };

  /**
   * Add pseudo stats (calculated stats like total resistance)
   */
  pseudoStats(stats: Array<{ id: string; min?: number; max?: number }>): this {
    const pseudoGroup = {
      type: 'and' as const,
      filters: stats.map(stat => ({
        id: `pseudo.${stat.id}`,
        value: {
          ...(stat.min !== undefined && { min: stat.min }),
          ...(stat.max !== undefined && { max: stat.max }),
        },
        disabled: false,
      })),
    };
    this.query.query.stats!.push(pseudoGroup);
    return this;
  }

  /**
   * Add total resistance filter (common PoE search)
   */
  totalResistance(min: number): this {
    return this.pseudoStats([{ id: 'pseudo.pseudo_total_elemental_resistance', min }]);
  }

  /**
   * Add total life + ES filter
   */
  totalLifeES(min: number): this {
    return this.pseudoStats([{ id: 'pseudo.pseudo_total_life', min }]);
  }

  /**
   * Add DPS filters for weapons
   */
  weaponDPS(physMin?: number, eleDMin?: number, totalMin?: number): this {
    const dpsStats = [];
    if (physMin) dpsStats.push({ id: 'pseudo.pseudo_physical_dps', min: physMin });
    if (eleDMin) dpsStats.push({ id: 'pseudo.pseudo_elemental_dps', min: eleDMin });
    if (totalMin) dpsStats.push({ id: 'pseudo.pseudo_total_dps', min: totalMin });
    return this.pseudoStats(dpsStats);
  }

  /**
   * Add item level filter
   */
  itemLevel(min?: number, max?: number): this {
    if (!this.query.query.filters?.misc_filters) {
      this.query.query.filters!.misc_filters = { filters: {} };
    }
    this.query.query.filters!.misc_filters.filters.ilvl = {
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max }),
    };
    return this;
  }

  /**
   * Add gem level filter
   */
  gemLevel(min?: number, max?: number): this {
    if (!this.query.query.filters?.misc_filters) {
      this.query.query.filters!.misc_filters = { filters: {} };
    }
    this.query.query.filters!.misc_filters.filters.gem_level = {
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max }),
    };
    return this;
  }

  /**
   * Add quality filter
   */
  quality(min?: number, max?: number): this {
    if (!this.query.query.filters?.misc_filters) {
      this.query.query.filters!.misc_filters = { filters: {} };
    }
    this.query.query.filters!.misc_filters.filters.quality = {
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max }),
    };
    return this;
  }

  /**
   * Add corrupted filter
   */
  corrupted(isCorrupted: boolean): this {
    if (!this.query.query.filters?.misc_filters) {
      this.query.query.filters!.misc_filters = { filters: {} };
    }
    this.query.query.filters!.misc_filters.filters.corrupted = {
      option: isCorrupted ? 'true' : 'false'
    };
    return this;
  }

  /**
   * Add influenced filter (PoE1)
   */
  influenced(influences: string[]): this {
    if (!this.query.query.filters?.misc_filters) {
      this.query.query.filters!.misc_filters = { filters: {} };
    }
    influences.forEach(influence => {
      this.query.query.filters!.misc_filters!.filters[influence] = { option: 'true' };
    });
    return this;
  }

  build(): TradeSearchQuery {
    return { ...this.query };
  }
}

// Rate limiting helpers from both tools
export class TradeRateLimiter {
  private limits: Map<string, { requests: number[]; maxRequests: number; windowMs: number }> = new Map();

  constructor() {
    // Default rate limits based on PoE API
    this.limits.set('search', { requests: [], maxRequests: 5, windowMs: 5000 }); // 5 per 5s
    this.limits.set('fetch', { requests: [], maxRequests: 10, windowMs: 5000 }); // 10 per 5s
  }

  canMakeRequest(type: 'search' | 'fetch'): boolean {
    const limit = this.limits.get(type);
    if (!limit) return true;

    const now = Date.now();
    // Remove old requests outside the window
    limit.requests = limit.requests.filter(time => now - time < limit.windowMs);
    
    return limit.requests.length < limit.maxRequests;
  }

  recordRequest(type: 'search' | 'fetch'): void {
    const limit = this.limits.get(type);
    if (limit) {
      limit.requests.push(Date.now());
    }
  }

  getWaitTime(type: 'search' | 'fetch'): number {
    const limit = this.limits.get(type);
    if (!limit || limit.requests.length === 0) return 0;

    const oldestRequest = Math.min(...limit.requests);
    const waitTime = limit.windowMs - (Date.now() - oldestRequest);
    return Math.max(0, waitTime);
  }
}
