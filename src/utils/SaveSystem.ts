import {
  SAVE_KEY,
  SaveData,
  defaultStats,
  defaultInventory,
  defaultQuests,
} from './types';

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SaveData;
  } catch {
    return null;
  }
}

export function hasSave(): boolean {
  return loadGame() !== null;
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}

export function newGameData(): SaveData {
  return {
    stats: defaultStats(),
    inventory: defaultInventory(),
    quests: defaultQuests(),
    tribeCount: 0,
    recruitedIds: [],
    craftedSpear: false,
    craftedBandage: false,
    playerX: 480,
    playerY: 520,
    killedEnemyIds: [],
    queenDefeated: false,
  };
}
