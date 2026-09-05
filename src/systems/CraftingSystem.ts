import { Inventory } from '../utils/types';

export interface CraftResult {
  ok: boolean;
  message: string;
  inventory: Inventory;
  spearUpgraded?: boolean;
  bandageUsed?: boolean;
  healAmount?: number;
}

export function craftSpear(inv: Inventory, already: boolean): CraftResult {
  if (already) {
    return { ok: false, message: 'Spear already upgraded.', inventory: inv };
  }
  if (inv.bronze_scrap < 3 || inv.wood < 2) {
    return {
      ok: false,
      message: 'Need 3 bronze scrap + 2 wood for spear upgrade.',
      inventory: inv,
    };
  }
  const next = { ...inv, bronze_scrap: inv.bronze_scrap - 3, wood: inv.wood - 2 };
  return {
    ok: true,
    message: 'Forged a bronze spear! +Damage, longer reach.',
    inventory: next,
    spearUpgraded: true,
  };
}

export function craftBandage(inv: Inventory): CraftResult {
  if (inv.herb < 2 || inv.wood < 1) {
    return {
      ok: false,
      message: 'Need 2 herb + 1 wood for a bandage.',
      inventory: inv,
    };
  }
  const next = { ...inv, herb: inv.herb - 2, wood: inv.wood - 1 };
  return {
    ok: true,
    message: 'Crafted bandage. Wounds bound (+40 HP).',
    inventory: next,
    bandageUsed: true,
    healAmount: 40,
  };
}
