import type { SurvivalStats } from '../utils/types';

export class Survival {
  stats: SurvivalStats = {
    health: 100,
    maxHealth: 100,
    stamina: 100,
    maxStamina: 100,
    food: 100,
    maxFood: 100,
    water: 100,
    maxWater: 100,
    torpor: 0,
    maxTorpor: 100,
  };

  private foodTimer = 0;
  private waterTimer = 0;
  private starveTimer = 0;

  update(dt: number, sprinting: boolean, moving: boolean) {
    const s = this.stats;
    // drain
    this.foodTimer += dt;
    this.waterTimer += dt;
    if (this.foodTimer >= 4) {
      this.foodTimer = 0;
      s.food = Math.max(0, s.food - (sprinting ? 1.4 : 0.7));
    }
    if (this.waterTimer >= 3.2) {
      this.waterTimer = 0;
      s.water = Math.max(0, s.water - (sprinting ? 1.6 : 0.9));
    }

    if (s.food <= 0 || s.water <= 0) {
      this.starveTimer += dt;
      if (this.starveTimer >= 1.5) {
        this.starveTimer = 0;
        s.health = Math.max(0, s.health - 3);
      }
    } else {
      this.starveTimer = 0;
    }

    if (sprinting && moving) {
      s.stamina = Math.max(0, s.stamina - 18 * dt);
    } else {
      s.stamina = Math.min(s.maxStamina, s.stamina + 14 * dt);
    }

    if (s.food > 40 && s.water > 40 && s.health < s.maxHealth) {
      s.health = Math.min(s.maxHealth, s.health + 2.5 * dt);
    }

    if (s.torpor > 0) s.torpor = Math.max(0, s.torpor - 8 * dt);
  }

  canSprint() {
    return this.stats.stamina > 1;
  }

  heal(n: number) {
    this.stats.health = Math.min(this.stats.maxHealth, this.stats.health + n);
  }

  eat(food: number, water = 0) {
    this.stats.food = Math.min(this.stats.maxFood, this.stats.food + food);
    this.stats.water = Math.min(this.stats.maxWater, this.stats.water + water);
  }

  drink(n: number) {
    this.stats.water = Math.min(this.stats.maxWater, this.stats.water + n);
  }

  damage(n: number) {
    this.stats.health = Math.max(0, this.stats.health - n);
  }

  dead() {
    return this.stats.health <= 0;
  }

  onLevelUp() {
    this.stats.maxHealth += 10;
    this.stats.maxStamina += 5;
    this.stats.health = this.stats.maxHealth;
    this.stats.stamina = this.stats.maxStamina;
  }
}
