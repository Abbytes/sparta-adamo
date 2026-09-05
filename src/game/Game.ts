import * as THREE from 'three';
import { Input } from './Input';
import { ThirdPersonCamera } from './ThirdPersonCamera';
import { World } from '../world/World';
import { Inventory } from '../systems/Inventory';
import { Survival } from '../systems/Survival';
import { Creature } from '../entities/Creature';
import { Enemy } from '../entities/Enemy';
import { HUD } from '../ui/HUD';
import { RECIPES, type ItemId } from '../utils/types';

export class Game {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private cameraCtrl: ThirdPersonCamera;
  private input: Input;
  private world: World;
  private inv = new Inventory();
  private survival = new Survival();
  private hud = new HUD();
  private player: THREE.Group;
  private playerPos = new THREE.Vector3(0, 0, 32);
  private yaw = 0;
  private creatures: Creature[] = [];
  private enemies: Enemy[] = [];
  private mounted: Creature | null = null;
  private attackCd = 0;
  private gatherCd = 0;
  private running = false;
  private clock = new THREE.Clock();
  private spawnPoint = new THREE.Vector3(0, 0, 32);
  private placed: Array<{ kind: ItemId; mesh: THREE.Object3D }> = [];
  private queenDead = false;
  private tames = 0;
  private objectiveStep = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.cameraCtrl = new ThirdPersonCamera(window.innerWidth / window.innerHeight);
    this.input = new Input(canvas);
    this.world = new World(this.scene);
    this.player = this.world.makeAdamo();
    this.player.position.copy(this.playerPos);
    this.scene.add(this.player);

    // starter tools engram-ready; give a little fiber so early craft feels good
    this.inv.add('fiber', 4);
    this.inv.add('wood', 2);
    this.inv.add('stone', 2);

    this.spawnCreatures();
    this.spawnEnemies();

    window.addEventListener('resize', () => {
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.cameraCtrl.resize(window.innerWidth, window.innerHeight);
    });

    document.getElementById('btn-start')?.addEventListener('click', () => this.start());
  }

  private spawnCreatures() {
    const wolves: Array<[number, number]> = [[-20, -12], [18, -20], [-35, -25], [30, -35]];
    const boars: Array<[number, number]> = [[-50, -48], [55, -42], [5, -50]];
    for (const [x, z] of wolves) {
      const m = this.world.makeWolf();
      this.scene.add(m);
      this.creatures.push(new Creature('wolf', m, x, z));
    }
    for (const [x, z] of boars) {
      const m = this.world.makeBoar();
      this.scene.add(m);
      this.creatures.push(new Creature('boar', m, x, z));
    }
  }

  private spawnEnemies() {
    const moms: Array<[number, number]> = [
      [48, -55], [60, -62], [70, -48], [52, -72], [78, -68],
    ];
    for (const [x, z] of moms) {
      const m = this.world.makeMomEnemy(false);
      this.scene.add(m);
      this.enemies.push(new Enemy(m, x, z, false));
    }
    const boss = this.world.makeMomEnemy(true);
    this.scene.add(boss);
    this.enemies.push(new Enemy(boss, 62, -60, true));
  }

  start() {
    this.hud.hideTitle();
    this.hud.showGameUI(true);
    this.running = true;
    this.clock.start();
    this.updateObjective();
    this.hud.toast('Gather resources. Craft a Stone Pick. Build your camp.');
    this.loop();
  }

  private loop = () => {
    if (!this.running) return;
    requestAnimationFrame(this.loop);
    const dt = Math.min(0.05, this.clock.getDelta());
    this.update(dt);
    this.renderer.render(this.scene, this.cameraCtrl.camera);
  };

  private update(dt: number) {
    this.input.beginFrame();
    this.hud.updateToast(dt);
    this.world.updateNodes(performance.now() / 1000);

    if (this.input.consumeInventory()) {
      const open = !this.hud.isInventoryOpen();
      this.hud.setInventoryOpen(open);
      if (open) this.refreshInvPanel();
      if (document.pointerLockElement) document.exitPointerLock();
    }

    const slot = this.input.consumeHotbar();
    if (slot !== null) this.inv.selected = slot;

    if (this.hud.isInventoryOpen()) {
      this.cameraCtrl.setLook(this.input.lookYaw, this.input.lookPitch);
      this.cameraCtrl.update(this.playerPos.clone().add(new THREE.Vector3(0, 1.2, 0)));
      this.hud.update(this.survival, this.inv, this.world.zoneLabel(this.world.getZone(this.playerPos.x, this.playerPos.z)));
      return;
    }

    // look
    this.cameraCtrl.setLook(this.input.lookYaw, this.input.lookPitch);
    this.yaw = this.input.lookYaw;

    const moving = Math.abs(this.input.moveX) + Math.abs(this.input.moveZ) > 0.05;
    const sprint = moving && this.input.sprintHeld && this.survival.canSprint();
    const speed = (this.mounted ? 9.5 : sprint ? 7.2 : 4.6);

    if (this.mounted) {
      const forward = this.cameraCtrl.forwardXZ();
      const right = this.cameraCtrl.rightXZ();
      const mx = forward.x * -this.input.moveZ + right.x * this.input.moveX;
      const mz = forward.z * -this.input.moveZ + right.z * this.input.moveX;
      const len = Math.hypot(mx, mz);
      if (len > 0.01) {
        const nx = this.mounted.position.x + (mx / len) * speed * dt;
        const nz = this.mounted.position.z + (mz / len) * speed * dt;
        const p = this.world.resolveCollision(nx, nz, 0.85);
        this.mounted.position.x = p.x;
        this.mounted.position.z = p.z;
        this.mounted.mesh.rotation.y = Math.atan2(mx, mz);
      }
      this.playerPos.set(this.mounted.position.x, 0, this.mounted.position.z);
      this.player.position.copy(this.playerPos);
      this.player.position.y = 1.1;
      this.player.rotation.y = this.mounted.mesh.rotation.y;
    } else {
      const forward = this.cameraCtrl.forwardXZ();
      const right = this.cameraCtrl.rightXZ();
      // moveX strafe, moveZ is screen-forward from pad (negative = forward on keyboard W)
      const mx = forward.x * -this.input.moveZ + right.x * this.input.moveX;
      const mz = forward.z * -this.input.moveZ + right.z * this.input.moveX;
      const len = Math.hypot(mx, mz);
      if (len > 0.01) {
        const nx = this.playerPos.x + (mx / len) * speed * dt;
        const nz = this.playerPos.z + (mz / len) * speed * dt;
        const p = this.world.resolveCollision(nx, nz, 0.45);
        this.playerPos.x = p.x;
        this.playerPos.z = p.z;
        this.player.rotation.y = Math.atan2(mx, mz);
      }
      this.player.position.copy(this.playerPos);
      this.player.position.y = 0;
    }

    this.survival.update(dt, sprint, moving);

    if (this.attackCd > 0) this.attackCd -= dt;
    if (this.gatherCd > 0) this.gatherCd -= dt;

    if (this.input.consumeAttack()) this.primaryAction();
    if (this.input.consumeInteract()) this.interact();
    if (this.input.consumeMount()) this.toggleMount();
    if (this.input.consumeWhistle()) this.whistle();

    // creatures / enemies
    for (const c of this.creatures) {
      if (c === this.mounted) continue;
      c.update(dt, this.playerPos, (x, z, r) => this.world.resolveCollision(x, z, r));
      if (!c.tamed && !c.unconscious && c.hp > 0 && c.attackCd <= 0) {
        if (c.position.distanceTo(this.playerPos) < 1.6) {
          this.survival.damage(c.damage * 0.35);
          c.attackCd = 1.1;
        }
      }
    }

    for (const e of this.enemies) {
      e.update(dt, this.playerPos, (x, z, r) => this.world.resolveCollision(x, z, r));
      if (e.alive && e.attackCd <= 0 && e.position.distanceTo(this.playerPos) < (e.boss ? 2.2 : 1.5)) {
        this.survival.damage(e.damage * 0.4);
        e.attackCd = e.boss ? 1.0 : 1.2;
      }
    }

    // tamed pets assist
    for (const c of this.creatures) {
      if (!c.tamed || !c.follow || c.hp <= 0) continue;
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (c.position.distanceTo(e.position) < 2.2 && c.attackCd <= 0) {
          e.hp -= c.damage * 0.5;
          c.attackCd = 0.9;
          if (e.hp <= 0) this.onEnemyKilled(e);
        }
      }
    }

    this.refreshStations();
    this.cameraCtrl.update(this.playerPos.clone().add(new THREE.Vector3(0, this.mounted ? 1.6 : 1.2, 0)));
    this.hud.update(this.survival, this.inv, this.world.zoneLabel(this.world.getZone(this.playerPos.x, this.playerPos.z)));
    this.updateObjective();

    if (this.survival.dead()) this.respawn();
  }

  private primaryAction() {
    const item = this.inv.selectedItem();
    // try gather
    if (this.tryGather(item)) return;
    // try knock creature / attack enemy
    this.tryCombat(item);
  }

  private tryGather(item: ItemId | null): boolean {
    if (this.gatherCd > 0) return false;
    let best: (typeof this.world.nodes)[0] | null = null;
    let bestD = 2.4;
    for (const n of this.world.nodes) {
      if (n.hp <= 0 || !n.mesh.visible) continue;
      const d = n.position.distanceTo(this.playerPos);
      if (d < bestD) {
        bestD = d;
        best = n;
      }
    }
    if (!best) return false;

    const hasPick = item === 'stonePick' || this.inv.count('stonePick') > 0;
    let dmg = 4;
    if (best.kind === 'wood' || best.kind === 'stone' || best.kind === 'metal') {
      dmg = hasPick ? 14 : 5;
    } else {
      dmg = 12;
    }
    best.hp -= dmg;
    this.gatherCd = 0.35;
    this.attackCd = 0.25;

    if (best.hp <= 0) {
      best.mesh.visible = false;
      best.respawnAt = performance.now() / 1000 + 45;
      const yieldAmt = best.kind === 'metal' ? 2 : best.kind === 'berry' || best.kind === 'fiber' ? 3 : 4;
      this.inv.add(best.kind, yieldAmt);
      if (best.kind === 'wood' || best.kind === 'fiber') {
        // chance of nothing else
      }
      this.hud.toast(`+${yieldAmt} ${best.kind}`);
      if (this.inv.addXp(6)) {
        this.survival.onLevelUp();
        this.hud.toast(`Level up! Engrams updated. Lv ${this.inv.level}`);
      }
    }
    return true;
  }

  private tryCombat(item: ItemId | null) {
    if (this.attackCd > 0) return;
    this.attackCd = 0.45;
    const melee = item === 'spear' ? 22 : 10;
    const torporHit = item === 'spear' ? 18 : 8;

    // creatures
    for (const c of this.creatures) {
      if (c.hp <= 0 || c.tamed) continue;
      if (c.position.distanceTo(this.playerPos) < 2.5) {
        c.hp -= melee * 0.35;
        c.applyTorpor(torporHit);
        this.hud.toast(c.unconscious ? `${c.kind} unconscious — feed berries/meat (E)` : `Hit ${c.kind} (torpor ${Math.floor(c.torpor)}/${c.maxTorpor})`);
        if (c.hp <= 0) {
          c.mesh.visible = false;
          this.inv.add('meat', 2);
          this.inv.addXp(12);
          this.hud.toast('Creature slain · +meat');
        }
        return;
      }
    }

    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (e.position.distanceTo(this.playerPos) < 2.6) {
        e.hp -= melee;
        if (e.hp <= 0) this.onEnemyKilled(e);
        else this.hud.toast(`${e.boss ? 'War-Queen' : 'Mom Tribe'} HP ${Math.ceil(e.hp)}`);
        return;
      }
    }
  }

  private onEnemyKilled(e: Enemy) {
    e.kill();
    this.inv.add('meat', e.boss ? 5 : 1);
    this.inv.add('fiber', 2);
    if (this.inv.addXp(e.boss ? 80 : 20)) {
      this.survival.onLevelUp();
      this.hud.toast(`Level up! Lv ${this.inv.level}`);
    }
    if (e.boss) {
      this.queenDead = true;
      this.hud.toast('War-Queen defeated! Sparta prevails.');
    } else {
      this.hud.toast('Mom Tribe warrior down');
    }
  }

  private interact() {
    // feed unconscious
    for (const c of this.creatures) {
      if (!c.unconscious || c.tamed) continue;
      if (c.position.distanceTo(this.playerPos) > 2.8) continue;
      if (c.feedCd > 0) {
        this.hud.toast('Wait to feed…');
        return;
      }
      const food: ItemId = this.inv.count('berry') > 0 ? 'berry' : this.inv.count('meat') > 0 ? 'meat' : this.inv.count('cookedMeat') > 0 ? 'cookedMeat' : 'fiber';
      if (this.inv.count(food) <= 0) {
        this.hud.toast('Need berries or meat to tame');
        return;
      }
      this.inv.remove(food, 1);
      const done = c.feed(food === 'cookedMeat' ? 35 : food === 'meat' ? 28 : food === 'berry' ? 22 : 8);
      this.hud.toast(done ? `Tamed ${c.kind}! Whistle (Q) follow · Mount (R)` : `Taming ${c.kind}: ${Math.floor(c.taming)}%`);
      if (done) {
        this.tames += 1;
        if (this.inv.addXp(40)) this.survival.onLevelUp();
      }
      return;
    }

    // drink water
    for (const w of this.world.waterSpots) {
      if (w.distanceTo(this.playerPos) < 4) {
        const bonus = this.inv.count('waterskin') > 0 ? 55 : 30;
        this.survival.drink(bonus);
        this.hud.toast(this.inv.count('waterskin') > 0 ? 'Drank from waterskin fill' : 'Drank from spring');
        return;
      }
    }

    // place structure if holding placeable
    const item = this.inv.selectedItem();
    if (item && this.isPlaceable(item) && this.inv.count(item) > 0) {
      this.placeStructure(item);
      return;
    }

    // use consumable from hotbar
    if (item) this.useItem(item);
  }

  private isPlaceable(id: ItemId) {
    return id === 'foundation' || id === 'wall' || id === 'campfire' || id === 'station' || id === 'bed';
  }

  private placeStructure(id: ItemId) {
    const zone = this.world.getZone(this.playerPos.x, this.playerPos.z);
    if (zone !== 'camp' && id !== 'campfire') {
      this.hud.toast('Build main structures at Sparta Camp');
      return;
    }
    if (!this.inv.remove(id, 1)) return;
    const forward = this.cameraCtrl.forwardXZ();
    const x = this.playerPos.x + forward.x * 2.5;
    const z = this.playerPos.z + forward.z * 2.5;

    let mesh: THREE.Object3D;
    if (id === 'foundation') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.35, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b7355, flatShading: true }),
      );
      mesh.position.set(x, 0.15, z);
      this.world.obstacles.push({
        mesh,
        box: { minX: x - 2, maxX: x + 2, minZ: z - 2, maxZ: z + 2 },
      });
    } else if (id === 'wall') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(4, 2.4, 0.35),
        new THREE.MeshStandardMaterial({ color: 0x7a6248, flatShading: true }),
      );
      mesh.position.set(x, 1.2, z);
      mesh.rotation.y = this.player.rotation.y;
      this.world.obstacles.push({
        mesh,
        box: { minX: x - 2, maxX: x + 2, minZ: z - 0.5, maxZ: z + 0.5 },
      });
    } else if (id === 'campfire') {
      mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.9, 0.5, 8),
        new THREE.MeshStandardMaterial({ color: 0xff6600, emissive: 0xaa2200 }),
      );
      mesh.position.set(x, 0.25, z);
    } else if (id === 'station') {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 1.4, 1.4),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.4, roughness: 0.5 }),
      );
      mesh.position.set(x, 0.7, z);
      this.world.obstacles.push({
        mesh,
        box: { minX: x - 1.2, maxX: x + 1.2, minZ: z - 0.9, maxZ: z + 0.9 },
      });
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.5, 1.0),
        new THREE.MeshStandardMaterial({ color: 0x6b3a2a, flatShading: true }),
      );
      mesh.position.set(x, 0.25, z);
      this.spawnPoint.set(x, 0, z);
    }
    this.scene.add(mesh);
    this.placed.push({ kind: id, mesh });
    this.hud.toast(`Placed ${id}`);
    this.inv.addXp(8);
    this.refreshStations();
  }

  private refreshStations() {
    this.inv.hasCampfireNearby = this.placed.some(
      (p) => p.kind === 'campfire' && p.mesh.position.distanceTo(this.playerPos) < 8,
    );
    this.inv.hasStationNearby = this.placed.some(
      (p) => p.kind === 'station' && p.mesh.position.distanceTo(this.playerPos) < 8,
    );
  }

  private useItem(id: ItemId) {
    if (id === 'berry' && this.inv.remove('berry', 1)) {
      this.survival.eat(18, 4);
      this.hud.toast('+Food (berry)');
    } else if (id === 'cookedMeat' && this.inv.remove('cookedMeat', 1)) {
      this.survival.eat(45, 5);
      this.hud.toast('+Food (cooked meat)');
    } else if (id === 'meat' && this.inv.remove('meat', 1)) {
      this.survival.eat(12, 0);
      this.survival.damage(2);
      this.hud.toast('Ate raw meat…');
    } else if (id === 'bandage' && this.inv.remove('bandage', 1)) {
      this.survival.heal(40);
      this.hud.toast('+40 Health');
    } else if (id === 'waterskin') {
      // refill at water handled in interact; here sip if any water in meter already full enough
      this.survival.drink(15);
      this.hud.toast('Sipped waterskin');
    } else if (this.isPlaceable(id)) {
      this.placeStructure(id);
    }
  }

  private toggleMount() {
    if (this.mounted) {
      this.mounted = null;
      this.player.position.y = 0;
      this.hud.toast('Dismounted');
      return;
    }
    for (const c of this.creatures) {
      if (!c.tamed || !c.rideable || c.hp <= 0) continue;
      if (c.position.distanceTo(this.playerPos) < 3.2) {
        this.mounted = c;
        c.follow = false;
        this.hud.toast(`Mounted ${c.kind}`);
        return;
      }
    }
    this.hud.toast('No tamed mount nearby');
  }

  private whistle() {
    let any = false;
    for (const c of this.creatures) {
      if (!c.tamed) continue;
      c.follow = !c.follow;
      any = true;
    }
    if (any) this.hud.toast(this.creatures.some((c) => c.tamed && c.follow) ? 'Tribe beasts: follow' : 'Tribe beasts: stay');
    else this.hud.toast('No tames yet');
  }

  private refreshInvPanel() {
    this.hud.renderInventory(
      this.inv,
      (id) => {
        const recipe = RECIPES.find((r) => r.id === id);
        if (!recipe) return;
        if (this.inv.craft(recipe)) {
          this.hud.toast(`Crafted ${recipe.name}`);
          if (this.inv.addXp(10)) {
            this.survival.onLevelUp();
            this.hud.toast(`Level up! Lv ${this.inv.level}`);
          }
          this.refreshInvPanel();
        } else {
          this.hud.toast('Cannot craft (level, mats, or station)');
        }
      },
      (id) => {
        this.useItem(id);
        this.refreshInvPanel();
      },
      (id) => {
        this.inv.hotbar[this.inv.selected] = id;
        this.hud.renderHotbar(this.inv);
        this.hud.toast(`Hotbar: ${id}`);
      },
    );
  }

  private updateObjective() {
    const hasPick = this.inv.count('stonePick') > 0;
    const hasSpear = this.inv.count('spear') > 0;
    const built = this.placed.some((p) => p.kind === 'foundation' || p.kind === 'campfire');
    if (!hasPick) {
      this.objectiveStep = 0;
      this.hud.setObjective('Gather fiber/wood/stone · Craft Stone Pick (C)');
    } else if (!hasSpear) {
      this.objectiveStep = 1;
      this.hud.setObjective('Craft a Spear · Knock out a wolf/boar to tame');
    } else if (this.tames < 1) {
      this.objectiveStep = 2;
      this.hud.setObjective('Pacify a beast (torpor) · Feed berries/meat (E)');
    } else if (!built) {
      this.objectiveStep = 3;
      this.hud.setObjective('Craft & place Campfire/Foundation at Camp');
    } else if (!this.queenDead) {
      this.objectiveStep = 4;
      this.hud.setObjective('Raid Mom Tribe Outpost · Defeat the War-Queen');
    } else {
      this.hud.setObjective('Victory — keep surviving, building, taming');
    }
  }

  private respawn() {
    this.hud.toast('You fell. Respawning at bed/camp…');
    this.playerPos.copy(this.spawnPoint);
    this.player.position.copy(this.spawnPoint);
    this.mounted = null;
    this.survival.stats.health = this.survival.stats.maxHealth * 0.6;
    this.survival.stats.food = Math.max(this.survival.stats.food, 35);
    this.survival.stats.water = Math.max(this.survival.stats.water, 35);
    this.survival.stats.stamina = this.survival.stats.maxStamina;
  }
}
