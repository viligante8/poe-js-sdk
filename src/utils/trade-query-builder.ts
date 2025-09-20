import type { TradeSearchQuery, StatGroup } from '../types';

export class TradeQueryBuilder {
  private query: TradeSearchQuery = {
    query: {
      stats: [],
      status: { option: 'online' },
      filters: {},
    },
  };

  /**
   * Set online status filter
   */
  onlineOnly(online: boolean = true): this {
    this.query.query.status = { option: online ? 'online' : 'any' };
    return this;
  }

  /**
   * Add item category filter
   */
  category(category: string): this {
    if (!this.query.query.filters?.type_filters) {
      this.query.query.filters!.type_filters = { filters: {} };
    }
    this.query.query.filters!.type_filters.filters.category = {
      option: category,
    };
    return this;
  }

  /**
   * Add item rarity filter
   */
  rarity(rarity: string): this {
    if (!this.query.query.filters?.type_filters) {
      this.query.query.filters!.type_filters = { filters: {} };
    }
    this.query.query.filters!.type_filters.filters.rarity = { option: rarity };
    return this;
  }

  /**
   * Add price filter
   */
  price(currency: string, min?: number, max?: number): this {
    if (!this.query.query.filters?.trade_filters) {
      this.query.query.filters!.trade_filters = { filters: {} };
    }
    this.query.query.filters!.trade_filters.filters.price = {
      option: currency,
      ...(min !== undefined && { min }),
      ...(max !== undefined && { max }),
    };
    return this;
  }

  /**
   * Add account name filter
   */
  account(accountName: string): this {
    if (!this.query.query.filters?.trade_filters) {
      this.query.query.filters!.trade_filters = { filters: {} };
    }
    this.query.query.filters!.trade_filters.filters.account = {
      input: accountName,
    };
    return this;
  }

  /**
   * Add stat filters with AND logic
   */
  andStats(filters: Array<{ id: string; min?: number; max?: number }>): this {
    const statGroup: StatGroup = {
      type: 'and',
      filters: filters.map((f) => ({
        id: f.id,
        value: {
          ...(f.min !== undefined && { min: f.min }),
          ...(f.max !== undefined && { max: f.max }),
        },
        disabled: false,
      })),
    };
    this.query.query.stats!.push(statGroup);
    return this;
  }

  /**
   * Add stat filters with OR logic
   */
  orStats(filters: Array<{ id: string; min?: number; max?: number }>): this {
    const statGroup: StatGroup = {
      type: 'or',
      filters: filters.map((f) => ({
        id: f.id,
        value: {
          ...(f.min !== undefined && { min: f.min }),
          ...(f.max !== undefined && { max: f.max }),
        },
        disabled: false,
      })),
    };
    this.query.query.stats!.push(statGroup);
    return this;
  }

  /**
   * Add weighted stat filters
   */
  weightedStats(filters: Array<{ id: string; weight: number }>): this {
    const statGroup: StatGroup = {
      type: 'weight2',
      filters: filters.map((f) => ({
        id: f.id,
        value: { weight: f.weight },
        disabled: false,
      })),
    };
    this.query.query.stats!.push(statGroup);
    return this;
  }

  /**
   * Build the final query
   */
  build(): TradeSearchQuery {
    return { ...this.query };
  }

  /**
   * Reset the builder
   */
  reset(): this {
    this.query = {
      query: {
        stats: [],
        status: { option: 'online' },
        filters: {},
      },
    };
    return this;
  }
}

// Common item categories
export const ItemCategories = {
  // Weapons
  WEAPON_ONE_HAND_SWORD: 'weapon.onesword',
  WEAPON_TWO_HAND_SWORD: 'weapon.twosword',
  WEAPON_ONE_HAND_AXE: 'weapon.oneaxe',
  WEAPON_TWO_HAND_AXE: 'weapon.twoaxe',
  WEAPON_ONE_HAND_MACE: 'weapon.onemace',
  WEAPON_TWO_HAND_MACE: 'weapon.twomace',
  WEAPON_BOW: 'weapon.bow',
  WEAPON_STAFF: 'weapon.staff',
  WEAPON_WAND: 'weapon.wand',
  WEAPON_DAGGER: 'weapon.dagger',
  WEAPON_CLAW: 'weapon.claw',

  // Armour
  ARMOUR_HELMET: 'armour.helmet',
  ARMOUR_CHEST: 'armour.chest',
  ARMOUR_BOOTS: 'armour.boots',
  ARMOUR_GLOVES: 'armour.gloves',
  ARMOUR_SHIELD: 'armour.shield',

  // Accessories
  ACCESSORY_RING: 'accessory.ring',
  ACCESSORY_AMULET: 'accessory.amulet',
  ACCESSORY_BELT: 'accessory.belt',

  // Gems
  GEM_SKILL: 'gem.activegem',
  GEM_SUPPORT: 'gem.supportgem',

  // Currency
  CURRENCY: 'currency',
} as const;

// Common currencies
export const Currencies = {
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
