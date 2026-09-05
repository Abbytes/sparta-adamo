import Phaser from 'phaser';
import { C } from '../utils/colors';

export type EnemyKind = 'grunt' | 'queen';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  kind: EnemyKind;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  xpValue: number;
  id: string;
  private aiState: 'patrol' | 'chase' | 'attack' | 'dead' = 'patrol';
  private patrolOrigin: { x: number; y: number };
  private patrolTarget: { x: number; y: number };
  private attackCd = 0;
  private aggroRange: number;
  private attackRange: number;
  private hpBar!: Phaser.GameObjects.Graphics;
  private dead = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    id: string,
    kind: EnemyKind = 'grunt'
  ) {
    super(scene, x, y, kind === 'queen' ? 'queen' : 'enemy');
    this.id = id;
    this.kind = kind;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);
    this.setCollideWorldBounds(true);

    if (kind === 'queen') {
      this.maxHp = 220;
      this.hp = 220;
      this.damage = 22;
      this.speed = 90;
      this.xpValue = 120;
      this.aggroRange = 220;
      this.attackRange = 48;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(24, 20);
      body.setOffset(8, 22);
    } else {
      this.maxHp = 40;
      this.hp = 40;
      this.damage = 10;
      this.speed = 70;
      this.xpValue = 18;
      this.aggroRange = 140;
      this.attackRange = 36;
      const body = this.body as Phaser.Physics.Arcade.Body;
      body.setSize(14, 12);
      body.setOffset(6, 14);
    }

    this.patrolOrigin = { x, y };
    this.patrolTarget = this.randomPatrol();
    this.hpBar = scene.add.graphics().setDepth(20);
  }

  private randomPatrol(): { x: number; y: number } {
    const r = this.kind === 'queen' ? 40 : 60;
    return {
      x: this.patrolOrigin.x + Phaser.Math.Between(-r, r),
      y: this.patrolOrigin.y + Phaser.Math.Between(-r, r),
    };
  }

  updateAI(player: Phaser.Physics.Arcade.Sprite, delta: number): number {
    if (this.dead) return 0;
    if (this.attackCd > 0) this.attackCd -= delta;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    let dealt = 0;

    if (dist < this.aggroRange) {
      this.aiState = dist < this.attackRange ? 'attack' : 'chase';
    } else if (this.aiState !== 'patrol') {
      this.aiState = 'patrol';
    }

    if (this.aiState === 'chase') {
      this.scene.physics.moveToObject(this, player, this.speed);
      this.setFlipX(player.x < this.x);
    } else if (this.aiState === 'attack') {
      this.setVelocity(0);
      if (this.attackCd <= 0) {
        this.attackCd = this.kind === 'queen' ? 900 : 1100;
        dealt = this.damage;
        this.setTint(C.crimsonBright);
        this.scene.time.delayedCall(100, () => this.clearTint());
      }
    } else {
      const dx = this.patrolTarget.x - this.x;
      const dy = this.patrolTarget.y - this.y;
      if (Math.abs(dx) + Math.abs(dy) < 8) {
        this.patrolTarget = this.randomPatrol();
      } else {
        this.scene.physics.moveTo(this, this.patrolTarget.x, this.patrolTarget.y, this.speed * 0.45);
      }
    }

    this.drawHp();
    return dealt;
  }

  takeDamage(amount: number): boolean {
    if (this.dead) return false;
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(80, () => this.clearTint());
    // brief knockback flash
    if (this.hp <= 0) {
      this.die();
      return true;
    }
    return false;
  }

  private die(): void {
    this.dead = true;
    this.aiState = 'dead';
    this.setVelocity(0);
    this.hpBar.destroy();
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.5,
      duration: 300,
      onComplete: () => this.destroy(),
    });
  }

  isDead(): boolean {
    return this.dead;
  }

  private drawHp(): void {
    this.hpBar.clear();
    if (this.dead) return;
    const w = this.kind === 'queen' ? 36 : 22;
    const x = this.x - w / 2;
    const y = this.y - (this.kind === 'queen' ? 28 : 20);
    this.hpBar.fillStyle(C.hpBg);
    this.hpBar.fillRect(x, y, w, 4);
    this.hpBar.fillStyle(this.kind === 'queen' ? C.gold : C.hp);
    this.hpBar.fillRect(x, y, w * (this.hp / this.maxHp), 4);
  }

  destroy(fromScene?: boolean): void {
    this.hpBar?.destroy();
    super.destroy(fromScene);
  }
}
