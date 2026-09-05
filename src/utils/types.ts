export type ZoneId = 'camp' | 'wilds' | 'pass' | 'outpost';

export type ResourceKind = 'fiber' | 'wood' | 'stone' | 'metal' | 'berry' | 'meat' | 'cookedMeat';

export type ItemId =
  | ResourceKind
  | 'stonePick'
  | 'spear'
  | 'torch'
  | 'waterskin'
  | 'bandage'
  | 'foundation'
  | 'wall'
  | 'campfire'
  | 'station'
  | 'bed';

export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface SurvivalStats {
  health: number;
  maxHealth: number;
  stamina: number;
  maxStamina: number;
  food: number;
  maxFood: number;
  water: number;
  maxWater: number;
  torpor: number;
  maxTorpor: number;
}

export interface Recipe {
  id: ItemId;
  name: string;
  engramLevel: number;
  costs: Partial<Record<ResourceKind, number>>;
  station?: 'hand' | 'campfire' | 'station';
  placeable?: boolean;
}

export const ITEM_NAMES: Record<ItemId, string> = {
  fiber: 'Fiber',
  wood: 'Wood',
  stone: 'Stone',
  metal: 'Metal',
  berry: 'Berry',
  meat: 'Raw Meat',
  cookedMeat: 'Cooked Meat',
  stonePick: 'Stone Pick',
  spear: 'Spear',
  torch: 'Torch',
  waterskin: 'Waterskin',
  bandage: 'Bandage',
  foundation: 'Foundation',
  wall: 'Wall',
  campfire: 'Campfire',
  station: 'Crafting Station',
  bed: 'Bed / Spawn',
};

export const RECIPES: Recipe[] = [
  { id: 'stonePick', name: 'Stone Pick', engramLevel: 1, costs: { wood: 2, stone: 3, fiber: 2 }, station: 'hand' },
  { id: 'spear', name: 'Spear', engramLevel: 1, costs: { wood: 4, fiber: 2, stone: 1 }, station: 'hand' },
  { id: 'torch', name: 'Torch', engramLevel: 1, costs: { wood: 1, fiber: 2 }, station: 'hand' },
  { id: 'waterskin', name: 'Waterskin', engramLevel: 2, costs: { fiber: 6, wood: 1 }, station: 'hand' },
  { id: 'campfire', name: 'Campfire', engramLevel: 2, costs: { wood: 8, stone: 4 }, station: 'hand', placeable: true },
  { id: 'foundation', name: 'Foundation', engramLevel: 3, costs: { wood: 10, stone: 5, fiber: 4 }, station: 'hand', placeable: true },
  { id: 'wall', name: 'Wall', engramLevel: 3, costs: { wood: 6, fiber: 4 }, station: 'hand', placeable: true },
  { id: 'bed', name: 'Bed', engramLevel: 4, costs: { fiber: 12, wood: 6 }, station: 'hand', placeable: true },
  { id: 'station', name: 'Crafting Station', engramLevel: 5, costs: { wood: 15, stone: 10, metal: 4 }, station: 'hand', placeable: true },
  { id: 'bandage', name: 'Bandage', engramLevel: 2, costs: { fiber: 8 }, station: 'hand' },
  { id: 'cookedMeat', name: 'Cooked Meat', engramLevel: 2, costs: { meat: 1, wood: 1 }, station: 'campfire' },
];
