import { ITEM_NAMES, type ItemId } from '../utils/types';
import type { Inventory } from '../systems/Inventory';
import type { Survival } from '../systems/Survival';

export class HUD {
  private toastTimer = 0;

  constructor() {
    document.getElementById('btn-close-inv')?.addEventListener('click', () => this.setInventoryOpen(false));
  }

  showGameUI(show: boolean) {
    document.getElementById('hud')?.classList.toggle('visible', show);
    const touch = document.getElementById('touch');
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    touch?.classList.toggle('visible', show && !isFine);
  }

  hideTitle() {
    document.getElementById('title-screen')?.classList.remove('active');
    (document.getElementById('title-screen') as HTMLElement).style.display = 'none';
  }

  toast(msg: string, sec = 2.4) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    this.toastTimer = sec;
  }

  updateToast(dt: number) {
    if (this.toastTimer <= 0) return;
    this.toastTimer -= dt;
    if (this.toastTimer <= 0) {
      const el = document.getElementById('toast');
      if (el) el.style.display = 'none';
    }
  }

  setObjective(text: string) {
    const el = document.getElementById('hud-obj');
    if (el) el.textContent = text;
  }

  update(survival: Survival, inv: Inventory, zone: string) {
    const s = survival.stats;
    const set = (id: string, text: string) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    };
    const bar = (id: string, v: number, max: number) => {
      const el = document.getElementById(id) as HTMLElement | null;
      if (el) el.style.width = `${Math.max(0, Math.min(100, (v / max) * 100))}%`;
    };
    set('v-hp', `${Math.ceil(s.health)}`);
    set('v-stam', `${Math.ceil(s.stamina)}`);
    set('v-food', `${Math.ceil(s.food)}`);
    set('v-water', `${Math.ceil(s.water)}`);
    bar('b-hp', s.health, s.maxHealth);
    bar('b-stam', s.stamina, s.maxStamina);
    bar('b-food', s.food, s.maxFood);
    bar('b-water', s.water, s.maxWater);
    set('v-lvl', String(inv.level));
    set('v-xp', String(Math.floor(inv.xp)));
    set('v-xpn', String(inv.xpToNext));
    set('v-zone', zone);
    this.renderHotbar(inv);
  }

  renderHotbar(inv: Inventory) {
    const root = document.getElementById('hotbar');
    if (!root) return;
    root.innerHTML = '';
    inv.hotbar.forEach((id, i) => {
      const slot = document.createElement('div');
      slot.className = 'slot' + (i === inv.selected ? ' active' : '');
      const key = document.createElement('div');
      key.className = 'key';
      key.textContent = String(i + 1);
      slot.appendChild(key);
      if (id) {
        const name = document.createElement('div');
        name.textContent = shortName(id);
        slot.appendChild(name);
        const qty = document.createElement('div');
        qty.className = 'qty';
        qty.textContent = String(inv.count(id));
        slot.appendChild(qty);
      }
      slot.addEventListener('click', () => {
        inv.selected = i;
        this.renderHotbar(inv);
      });
      root.appendChild(slot);
    });
  }

  setInventoryOpen(open: boolean) {
    document.getElementById('inv-panel')?.classList.toggle('open', open);
  }

  isInventoryOpen() {
    return document.getElementById('inv-panel')?.classList.contains('open') ?? false;
  }

  renderInventory(
    inv: Inventory,
    onCraft: (id: ItemId) => void,
    onUse: (id: ItemId) => void,
    onEquip: (id: ItemId) => void,
  ) {
    const invList = document.getElementById('inv-list');
    const craftList = document.getElementById('craft-list');
    if (!invList || !craftList) return;
    invList.innerHTML = '';
    for (const row of inv.listNonZero()) {
      const el = document.createElement('div');
      el.className = 'row';
      el.innerHTML = `<span>${row.name} ×${row.qty}</span>`;
      const actions = document.createElement('div');
      const use = document.createElement('button');
      use.type = 'button';
      use.textContent = 'Use';
      use.onclick = () => onUse(row.id);
      const eq = document.createElement('button');
      eq.type = 'button';
      eq.textContent = 'Hotbar';
      eq.onclick = () => onEquip(row.id);
      actions.append(use, eq);
      el.appendChild(actions);
      invList.appendChild(el);
    }
    craftList.innerHTML = '';
    for (const r of inv.recipes()) {
      const el = document.createElement('div');
      el.className = 'row';
      const cost = Object.entries(r.costs).map(([k, v]) => `${v} ${k}`).join(', ');
      const lock = inv.unlocked(r) ? '' : ` (Lv ${r.engramLevel})`;
      el.innerHTML = `<span>${r.name}${lock}<br/><small>${cost}${r.station && r.station !== 'hand' ? ' @ ' + r.station : ''}${r.placeable ? ' · placeable' : ''}</small></span>`;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = 'Craft';
      btn.disabled = !inv.canCraft(r);
      btn.onclick = () => onCraft(r.id);
      el.appendChild(btn);
      craftList.appendChild(el);
    }
  }
}

function shortName(id: ItemId): string {
  const n = ITEM_NAMES[id];
  return n.length > 7 ? n.slice(0, 6) + '…' : n;
}
