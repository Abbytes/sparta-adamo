import { ITEM_NAMES, RECIPES, type ItemId, type Recipe, type ResourceKind } from '../utils/types';

export class Inventory {
  stacks = new Map<ItemId, number>();
  hotbar: (ItemId | null)[] = ['stonePick', 'spear', null, null, null];
  selected = 0;
  level = 1;
  xp = 0;
  xpToNext = 80;
  hasCampfireNearby = false;
  hasStationNearby = false;

  add(id: ItemId, n = 1) {
    this.stacks.set(id, (this.stacks.get(id) ?? 0) + n);
    this.ensureHotbar(id);
  }

  count(id: ItemId) {
    return this.stacks.get(id) ?? 0;
  }

  remove(id: ItemId, n: number) {
    const cur = this.count(id);
    if (cur < n) return false;
    const next = cur - n;
    if (next <= 0) this.stacks.delete(id);
    else this.stacks.set(id, next);
    return true;
  }

  private ensureHotbar(id: ItemId) {
    if (this.hotbar.includes(id)) return;
    const empty = this.hotbar.indexOf(null);
    if (empty >= 0) this.hotbar[empty] = id;
  }

  selectedItem(): ItemId | null {
    return this.hotbar[this.selected] ?? null;
  }

  unlocked(recipe: Recipe) {
    return this.level >= recipe.engramLevel;
  }

  canCraft(recipe: Recipe) {
    if (!this.unlocked(recipe)) return false;
    if (recipe.station === 'campfire' && !this.hasCampfireNearby) return false;
    if (recipe.station === 'station' && !this.hasStationNearby) return false;
    for (const [k, v] of Object.entries(recipe.costs) as [ResourceKind, number][]) {
      if (this.count(k) < v) return false;
    }
    return true;
  }

  craft(recipe: Recipe): boolean {
    if (!this.canCraft(recipe)) return false;
    for (const [k, v] of Object.entries(recipe.costs) as [ResourceKind, number][]) {
      this.remove(k, v);
    }
    this.add(recipe.id, 1);
    return true;
  }

  addXp(n: number): boolean {
    this.xp += n;
    let leveled = false;
    while (this.xp >= this.xpToNext) {
      this.xp -= this.xpToNext;
      this.level += 1;
      this.xpToNext = Math.floor(this.xpToNext * 1.35 + 20);
      leveled = true;
    }
    return leveled;
  }

  listNonZero(): Array<{ id: ItemId; name: string; qty: number }> {
    const out: Array<{ id: ItemId; name: string; qty: number }> = [];
    for (const [id, qty] of this.stacks) {
      if (qty > 0) out.push({ id, name: ITEM_NAMES[id], qty });
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  recipes(): Recipe[] {
    return RECIPES;
  }
}
