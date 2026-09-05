export interface PlayerStats {
  level: number;
  xp: number;
  xpToNext: number;
  maxHp: number;
  hp: number;
  damage: number;
  shield: number;
  maxShield: number;
}

export interface Inventory {
  bronze_scrap: number;
  herb: number;
  wood: number;
  bronze: number;
}

export interface QuestState {
  gatheredMaterials: boolean;
  recruitedTwo: boolean;
  clearedOutpost: boolean;
  defeatedQueen: boolean;
}

export interface SaveData {
  stats: PlayerStats;
  inventory: Inventory;
  quests: QuestState;
  tribeCount: number;
  recruitedIds: string[];
  craftedSpear: boolean;
  craftedBandage: boolean;
  playerX: number;
  playerY: number;
  killedEnemyIds: string[];
  queenDefeated: boolean;
}

export const SAVE_KEY = 'sparta-adamo-save';

export function xpForLevel(level: number): number {
  return 40 + level * 35;
}

export function defaultStats(): PlayerStats {
  return {
    level: 1,
    xp: 0,
    xpToNext: xpForLevel(1),
    maxHp: 100,
    hp: 100,
    damage: 12,
    shield: 0,
    maxShield: 20,
  };
}

export function defaultInventory(): Inventory {
  return { bronze_scrap: 0, herb: 0, wood: 0, bronze: 5 };
}

export function defaultQuests(): QuestState {
  return {
    gatheredMaterials: false,
    recruitedTwo: false,
    clearedOutpost: false,
    defeatedQueen: false,
  };
}
