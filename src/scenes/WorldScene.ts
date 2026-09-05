import Phaser from 'phaser';
import { SpriteFactory } from '../systems/SpriteFactory';
import { buildMap, MAP_W, MAP_H, MapResult } from '../systems/MapBuilder';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Follower } from '../entities/Follower';
import { Pickup, MaterialType } from '../entities/Pickup';
import { HUD } from '../ui/HUD';
import { craftSpear, craftBandage } from '../systems/CraftingSystem';
import { grantXp } from '../systems/LevelSystem';
import {
  SaveData,
  Inventory,
  QuestState,
} from '../utils/types';
import { loadGame, saveGame, newGameData } from '../utils/SaveSystem';
import { C } from '../utils/colors';

export class WorldScene extends Phaser.Scene {
  private player!: Player;
  private enemies: Enemy[] = [];
  private enemyGroup!: Phaser.Physics.Arcade.Group;
  private followers: Follower[] = [];
  private pickups!: Phaser.Physics.Arcade.Group;
  private map!: MapResult;
  private hud!: HUD;
  private inventory!: Inventory;
  private quests!: QuestState;
  private recruitedIds: string[] = [];
  private killedEnemyIds: string[] = [];
  private craftedSpear = false;
  private craftedBandage = false;
  private queenDefeated = false;
  private outpostEnemyIds: string[] = [];

  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private keyE!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keyEsc!: Phaser.Input.Keyboard.Key;

  private interactLock = false;
  private victoryTriggered = false;
  private currentZone = 'Sparta Camp';

  constructor() {
    super('WorldScene');
  }

  init(): void {
    this.enemies = [];
    this.followers = [];
    this.recruitedIds = [];
    this.killedEnemyIds = [];
    this.craftedSpear = false;
    this.craftedBandage = false;
    this.queenDefeated = false;
    this.outpostEnemyIds = [];
    this.interactLock = false;
    this.victoryTriggered = false;
  }

  create(data: { loadSave?: boolean }): void {
    SpriteFactory.generate(this);

    const save =
      data?.loadSave ? loadGame() : null;
    const state: SaveData = save ?? newGameData();

    this.inventory = { ...state.inventory };
    this.quests = { ...state.quests };
    this.recruitedIds = [...state.recruitedIds];
    this.killedEnemyIds = [...state.killedEnemyIds];
    this.craftedSpear = state.craftedSpear;
    this.craftedBandage = state.craftedBandage;
    this.queenDefeated = state.queenDefeated;

    this.physics.world.setBounds(0, 0, MAP_W * 32, MAP_H * 32);
    this.cameras.main.setBounds(0, 0, MAP_W * 32, MAP_H * 32);
    this.cameras.main.setBackgroundColor(C.dark);

    this.map = buildMap(this);

    this.player = new Player(this, state.playerX, state.playerY, { ...state.stats });
    if (this.craftedSpear) {
      this.player.craftedSpear = true;
      this.player.stats.damage = Math.max(this.player.stats.damage, 18);
    }

    this.physics.add.collider(this.player, this.map.walls);

    this.pickups = this.physics.add.group();
    this.enemyGroup = this.physics.add.group();
    this.spawnPickups();

    this.spawnEnemies();

    // restore followers
    for (let i = 0; i < state.tribeCount; i++) {
      this.spawnFollower(i);
    }

    // hide rescue NPC if already recruited
    if (this.recruitedIds.includes('rescue')) {
      this.map.interactables.npcSprite.setVisible(false);
      const label = this.children.getByName('rescueLabel') as Phaser.GameObjects.Text | null;
      label?.setVisible(false);
    }

    this.hud = new HUD(this);

    this.physics.add.overlap(
      this.player,
      this.pickups,
      (_p, pk) => this.collectPickup(pk as Pickup),
      undefined,
      this
    );

    // attack hit overlap
    this.physics.add.overlap(
      this.player.getHitbox(),
      this.enemyGroup,
      (_hit, enemyObj) => {
        const enemy = enemyObj as unknown as Enemy;
        if (!enemy.active || enemy.isDead()) return;
        if (!this.player.getHitbox().active) return;
        // only damage once per swing — mark with cooldown on enemy via data
        const last = (enemy.getData('lastHit') as number) || 0;
        if (this.time.now - last < 300) return;
        enemy.setData('lastHit', this.time.now);
        const dmg = this.player.stats.damage;
        const killed = enemy.takeDamage(dmg);
        if (killed) this.onEnemyKilled(enemy);
      }
    );

    const kb = this.input.keyboard!;
    this.cursors = kb.createCursorKeys();
    this.wasd = {
      W: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
    this.keyE = kb.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyShift = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.keyEsc = kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setZoom(1);

    if (data?.loadSave) {
      this.hud.showToast('Campaign continued.');
    } else {
      this.hud.showToast('Gather materials. Build your tribe. Crush the Mom Tribe.');
    }

    this.time.addEvent({
      delay: 15000,
      loop: true,
      callback: () => this.persist(),
    });
  }

  private spawnPickups(): void {
    const spots: { x: number; y: number; m: MaterialType; a: number }[] = [
      // wilds
      { x: 10 * 32, y: 14 * 32, m: 'bronze_scrap', a: 1 },
      { x: 14 * 32, y: 16 * 32, m: 'bronze_scrap', a: 1 },
      { x: 22 * 32, y: 15 * 32, m: 'bronze_scrap', a: 2 },
      { x: 26 * 32, y: 18 * 32, m: 'bronze_scrap', a: 1 },
      { x: 12 * 32, y: 18 * 32, m: 'herb', a: 1 },
      { x: 16 * 32, y: 13 * 32, m: 'herb', a: 1 },
      { x: 24 * 32, y: 17 * 32, m: 'herb', a: 2 },
      { x: 28 * 32, y: 14 * 32, m: 'herb', a: 1 },
      { x: 9 * 32, y: 17 * 32, m: 'wood', a: 1 },
      { x: 18 * 32, y: 19 * 32, m: 'wood', a: 2 },
      { x: 23 * 32, y: 13 * 32, m: 'wood', a: 1 },
      { x: 30 * 32, y: 16 * 32, m: 'wood', a: 1 },
      // mountain extras
      { x: 8 * 32, y: 7 * 32, m: 'bronze_scrap', a: 2 },
      { x: 3 * 32, y: 9 * 32, m: 'wood', a: 2 },
      // near outpost fringe
      { x: 27 * 32, y: 11 * 32, m: 'herb', a: 1 },
    ];
    for (const s of spots) {
      const p = new Pickup(this, s.x + 16, s.y + 16, s.m, s.a);
      this.pickups.add(p);
    }
  }

  private spawnEnemies(): void {
    const grunts: { id: string; x: number; y: number }[] = [
      { id: 'w1', x: 12 * 32, y: 15 * 32 },
      { id: 'w2', x: 17 * 32, y: 14 * 32 },
      { id: 'w3', x: 25 * 32, y: 16 * 32 },
      { id: 'w4', x: 21 * 32, y: 12 * 32 },
      { id: 'm1', x: 7 * 32, y: 8 * 32 },
      { id: 'm2', x: 10 * 32, y: 5 * 32 },
      { id: 'o1', x: 29 * 32, y: 6 * 32 },
      { id: 'o2', x: 33 * 32, y: 5 * 32 },
      { id: 'o3', x: 35 * 32, y: 8 * 32 },
      { id: 'o4', x: 31 * 32, y: 9 * 32 },
      { id: 'o5', x: 37 * 32, y: 6 * 32 },
    ];
    this.outpostEnemyIds = ['o1', 'o2', 'o3', 'o4', 'o5', 'queen'];

    for (const g of grunts) {
      if (this.killedEnemyIds.includes(g.id)) continue;
      const e = new Enemy(this, g.x + 16, g.y + 16, g.id, 'grunt');
      this.enemies.push(e);
      this.physics.add.collider(e as unknown as Phaser.Physics.Arcade.Sprite, this.map.walls);
      this.physics.add.collider(e as unknown as Phaser.Physics.Arcade.Sprite, this.player);
    }

    if (!this.killedEnemyIds.includes('queen') && !this.queenDefeated) {
      const queen = new Enemy(this, 33 * 32, 4 * 32, 'queen', 'queen');
      this.enemies.push(queen);
      this.physics.add.collider(queen as unknown as Phaser.Physics.Arcade.Sprite, this.map.walls);
      this.physics.add.collider(queen as unknown as Phaser.Physics.Arcade.Sprite, this.player);
    }
  }

  private spawnFollower(index: number): void {
    const f = new Follower(
      this,
      this.player.x + Phaser.Math.Between(-30, 30),
      this.player.y + Phaser.Math.Between(-30, 30),
      index
    );
    this.followers.push(f);
    this.physics.add.collider(f, this.map.walls);
  }

  private collectPickup(pk: Pickup): void {
    if (!pk.active) return;
    this.inventory[pk.material] += pk.amount;
    this.hud.showToast(`+${pk.amount} ${pk.material.replace('_', ' ')}`);
    pk.destroy();
    this.checkGatherQuest();
    this.persist();
  }

  private checkGatherQuest(): void {
    if (this.quests.gatheredMaterials) return;
    if (
      this.inventory.bronze_scrap >= 3 &&
      this.inventory.herb >= 2 &&
      this.inventory.wood >= 2
    ) {
      this.quests.gatheredMaterials = true;
      this.hud.showToast('Materials gathered. Return to camp to craft & recruit.');
    }
  }

  private onEnemyKilled(enemy: Enemy): void {
    if (!this.killedEnemyIds.includes(enemy.id)) {
      this.killedEnemyIds.push(enemy.id);
    }
    const result = grantXp(this.player.stats, enemy.xpValue);
    this.player.stats = result.stats;
    this.hud.showToast(`+${enemy.xpValue} XP`);
    if (result.leveled && result.message) {
      this.time.delayedCall(400, () => this.hud.showToast(result.message!));
    }

    if (enemy.kind === 'queen') {
      this.queenDefeated = true;
      this.quests.defeatedQueen = true;
      this.quests.clearedOutpost = true;
      this.hud.showToast('The War-Queen is slain!');
      this.persist();
      if (!this.victoryTriggered) {
        this.victoryTriggered = true;
        this.time.delayedCall(2000, () => this.scene.start('VictoryScene'));
      }
      return;
    }

    // check outpost clear
    const outpostAlive = this.enemies.some(
      (e) =>
        !e.isDead() &&
        this.outpostEnemyIds.includes(e.id) &&
        e.id !== 'queen'
    );
    if (!outpostAlive && !this.quests.clearedOutpost) {
      // still need queen, but mark grunts cleared for objective progression feel
      const gruntsLeft = this.outpostEnemyIds
        .filter((id) => id !== 'queen')
        .some((id) => !this.killedEnemyIds.includes(id));
      if (!gruntsLeft) {
        this.quests.clearedOutpost = true;
        this.hud.showToast('Outpost grunts cleared. Face the War-Queen!');
      }
    }

    // chance drop
    if (Phaser.Math.Between(0, 100) < 40) {
      const mats: MaterialType[] = ['bronze_scrap', 'herb', 'wood'];
      const m = mats[Phaser.Math.Between(0, 2)];
      const drop = new Pickup(this, enemy.x, enemy.y, m, 1);
      this.pickups.add(drop);
    }

    this.persist();
  }

  update(_t: number, delta: number): void {
    if (!this.player?.active) return;

    this.player.update(
      this.cursors,
      this.wasd,
      this.keySpace,
      this.keyShift,
      this.input.activePointer,
      delta
    );

    // enemy AI + damage to player
    for (const e of this.enemies) {
      if (e.isDead() || !e.active) continue;
      const dealt = e.updateAI(this.player, delta);
      if (dealt > 0) {
        const dist = Phaser.Math.Distance.Between(e.x, e.y, this.player.x, this.player.y);
        if (dist < (e.kind === 'queen' ? 52 : 40)) {
          const dead = this.player.takeDamage(dealt);
          if (dead) {
            this.persist();
            this.scene.start('GameOverScene', {
              reason: e.kind === 'queen'
                ? 'Slain by the Mom Tribe War-Queen.'
                : 'Slain by a Mom Tribe warrior.',
            });
            return;
          }
        }
      }
    }

    // followers
    const liveEnemies = this.enemies.filter((e) => !e.isDead() && e.active);
    for (const f of this.followers) {
      f.updateFollow(this.player, liveEnemies, delta);
      // check if follower killed someone (Enemy.takeDamage already handles death)
      for (const e of liveEnemies) {
        if (e.isDead() && !this.killedEnemyIds.includes(e.id)) {
          this.onEnemyKilled(e);
        }
      }
    }

    // interact
    if (Phaser.Input.Keyboard.JustDown(this.keyE) && !this.interactLock) {
      this.tryInteract();
    }

    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.persist();
      this.hud.showToast('Progress saved.');
    }

    this.updateZone();
    this.hud.update(
      this.player.stats,
      this.inventory,
      this.followers.length,
      this.quests,
      this.currentZone,
      this.craftedSpear
    );
  }

  private updateZone(): void {
    for (const z of this.map.zones) {
      if (z.rect.contains(this.player.x, this.player.y)) {
        this.currentZone = z.name;
        return;
      }
    }
    this.currentZone = 'The Wilds';
  }

  private tryInteract(): void {
    const p = this.player;
    const near = (zone: Phaser.GameObjects.Zone, range = 50) =>
      Phaser.Math.Distance.Between(p.x, p.y, zone.x, zone.y) < range;

    const { anvil, bench, recruitSpot, rescueNpc, npcSprite } = this.map.interactables;

    if (near(anvil)) {
      this.openAnvil();
      return;
    }
    if (near(bench)) {
      this.openBench();
      return;
    }
    if (near(recruitSpot)) {
      this.tryRecruitHire();
      return;
    }
    if (near(rescueNpc) && npcSprite.visible && !this.recruitedIds.includes('rescue')) {
      this.recruitRescue();
      return;
    }
  }

  private openAnvil(): void {
    this.interactLock = true;
    const result = craftSpear(this.inventory, this.craftedSpear);
    this.inventory = result.inventory;
    if (result.ok && result.spearUpgraded) {
      this.craftedSpear = true;
      this.player.craftedSpear = true;
      this.player.stats.damage += 6;
      this.hud.showToast(result.message);
    } else {
      this.hud.showToast(result.message);
    }
    this.checkGatherQuest();
    this.persist();
    this.time.delayedCall(400, () => {
      this.interactLock = false;
    });
  }

  private openBench(): void {
    this.interactLock = true;
    const result = craftBandage(this.inventory);
    this.inventory = result.inventory;
    if (result.ok && result.healAmount) {
      this.craftedBandage = true;
      this.player.heal(result.healAmount);
      this.hud.showToast(result.message);
    } else {
      this.hud.showToast(result.message);
    }
    this.persist();
    this.time.delayedCall(400, () => {
      this.interactLock = false;
    });
  }

  private tryRecruitHire(): void {
    this.interactLock = true;
    if (this.recruitedIds.includes('hire')) {
      this.hud.showToast('Already recruited a camp warrior.');
      this.time.delayedCall(400, () => {
        this.interactLock = false;
      });
      return;
    }
    if (this.inventory.bronze < 3) {
      this.hud.showToast('Need 3 bronze coins to hire a warrior.');
      this.time.delayedCall(400, () => {
        this.interactLock = false;
      });
      return;
    }
    this.inventory.bronze -= 3;
    this.recruitedIds.push('hire');
    this.spawnFollower(this.followers.length);
    this.hud.showToast('A Spartan joins your tribe!');
    this.checkRecruitQuest();
    this.persist();
    this.time.delayedCall(400, () => {
      this.interactLock = false;
    });
  }

  private recruitRescue(): void {
    this.interactLock = true;
    this.recruitedIds.push('rescue');
    this.map.interactables.npcSprite.setVisible(false);
    const label = this.children.getByName('rescueLabel') as Phaser.GameObjects.Text | null;
    label?.setVisible(false);
    this.spawnFollower(this.followers.length);
    this.hud.showToast('Rescued a captive — they swear loyalty!');
    this.checkRecruitQuest();
    this.persist();
    this.time.delayedCall(400, () => {
      this.interactLock = false;
    });
  }

  private checkRecruitQuest(): void {
    if (this.followers.length >= 2 && !this.quests.recruitedTwo) {
      this.quests.recruitedTwo = true;
      this.hud.showToast('Tribe assembled. March on the Mom Tribe Outpost!');
    }
  }

  private persist(): void {
    const data: SaveData = {
      stats: { ...this.player.stats },
      inventory: { ...this.inventory },
      quests: { ...this.quests },
      tribeCount: this.followers.length,
      recruitedIds: [...this.recruitedIds],
      craftedSpear: this.craftedSpear,
      craftedBandage: this.craftedBandage,
      playerX: this.player.x,
      playerY: this.player.y,
      killedEnemyIds: [...this.killedEnemyIds],
      queenDefeated: this.queenDefeated,
    };
    saveGame(data);
  }
}
