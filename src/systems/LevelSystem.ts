import { PlayerStats, xpForLevel } from '../utils/types';

export interface LevelUpResult {
  leveled: boolean;
  stats: PlayerStats;
  message?: string;
}

export function grantXp(stats: PlayerStats, amount: number): LevelUpResult {
  const next = { ...stats, xp: stats.xp + amount };
  let leveled = false;
  let message: string | undefined;
  while (next.xp >= next.xpToNext) {
    next.xp -= next.xpToNext;
    next.level += 1;
    next.xpToNext = xpForLevel(next.level);
    // auto-boost on level up
    next.maxHp += 15;
    next.hp = next.maxHp;
    next.damage += 3;
    next.maxShield += 5;
    next.shield = next.maxShield;
    leveled = true;
    message = `LEVEL ${next.level}! HP+15  DMG+3  SHIELD+5`;
  }
  return { leveled, stats: next, message };
}
