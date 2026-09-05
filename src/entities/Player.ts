import Phaser from 'phaser';
import { PlayerStats } from '../utils/types';
import { C } from '../utils/colors';

export class Player extends Phaser.Physics.Arcade.Sprite {
  stats: PlayerStats;
  speed = 160;
  isBlocking = false;
  isAttacking = false;
  attackCooldown = 0;
  invuln = 0;
  craftedSpear = false;
  private facing: 'up' | 'down' | 'left' | 'right' = 'down';
  private pointerWasDown = false;
  private attackHitbox!: Phaser.Physics.Arcade.Image;
  private blockGfx!: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, stats: PlayerStats) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.stats = stats;
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(16, 14);
    body.setOffset(6, 16);

    this.attackHitbox = scene.physics.add.image(x, y, 'slash');
    this.attackHitbox.setVisible(false);
    this.attackHitbox.setActive(false);
    (this.attackHitbox.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    this.attackHitbox.setDepth(11);

    this.blockGfx = scene.add.image(x, y, 'block_shield').setVisible(false).setDepth(12);
  }

  getHitbox(): Phaser.Physics.Arcade.Image {
    return this.attackHitbox;
  }

  update(
    cursors: Phaser.Types.Input.Keyboard.CursorKeys,
    wasd: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key },
    space: Phaser.Input.Keyboard.Key,
    shift: Phaser.Input.Keyboard.Key,
    pointer: Phaser.Input.Pointer,
    delta: number
  ): void {
    if (this.invuln > 0) {
      this.invuln -= delta;
      this.setAlpha(Math.sin(this.invuln / 40) > 0 ? 1 : 0.4);
    } else {
      this.setAlpha(1);
    }

    if (this.attackCooldown > 0) this.attackCooldown -= delta;

    this.isBlocking = shift.isDown && !this.isAttacking;
    this.blockGfx.setVisible(this.isBlocking);
    if (this.isBlocking) {
      this.blockGfx.setPosition(this.x + 10, this.y);
      this.setVelocity(0);
      return;
    }

    let vx = 0;
    let vy = 0;
    if (cursors.left.isDown || wasd.A.isDown) vx -= 1;
    if (cursors.right.isDown || wasd.D.isDown) vx += 1;
    if (cursors.up.isDown || wasd.W.isDown) vy -= 1;
    if (cursors.down.isDown || wasd.S.isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.sqrt(vx * vx + vy * vy);
      vx = (vx / len) * this.speed;
      vy = (vy / len) * this.speed;
      if (Math.abs(vx) > Math.abs(vy)) {
        this.facing = vx > 0 ? 'right' : 'left';
      } else {
        this.facing = vy > 0 ? 'down' : 'up';
      }
      this.setFlipX(this.facing === 'left');
    }
    this.setVelocity(vx, vy);

    const pointerJust = pointer.leftButtonDown() && !this.pointerWasDown;
    this.pointerWasDown = pointer.leftButtonDown();
    if (
      (Phaser.Input.Keyboard.JustDown(space) || pointerJust) &&
      this.attackCooldown <= 0 &&
      !this.isAttacking
    ) {
      this.doAttack();
    }
  }

  doAttack(): void {
    this.isAttacking = true;
    this.attackCooldown = this.craftedSpear ? 280 : 380;
    const reach = this.craftedSpear ? 42 : 32;
    let ox = 0;
    let oy = 0;
    let rot = 0;
    switch (this.facing) {
      case 'right':
        ox = reach;
        rot = 0;
        break;
      case 'left':
        ox = -reach;
        rot = Math.PI;
        break;
      case 'up':
        oy = -reach;
        rot = -Math.PI / 2;
        break;
      case 'down':
        oy = reach;
        rot = Math.PI / 2;
        break;
    }
    this.attackHitbox.setPosition(this.x + ox, this.y + oy);
    this.attackHitbox.setRotation(rot);
    this.attackHitbox.setVisible(true);
    this.attackHitbox.setActive(true);
    this.attackHitbox.setAlpha(1);
    const body = this.attackHitbox.body as Phaser.Physics.Arcade.Body;
    body.enable = true;
    body.setSize(28, 16);

    this.scene.tweens.add({
      targets: this.attackHitbox,
      alpha: 0,
      duration: 160,
      onComplete: () => {
        this.attackHitbox.setVisible(false);
        this.attackHitbox.setActive(false);
        body.enable = false;
        this.isAttacking = false;
      },
    });
  }

  takeDamage(amount: number): boolean {
    if (this.invuln > 0) return false;
    let dmg = amount;
    if (this.isBlocking) {
      const absorbed = Math.min(this.stats.shield + this.stats.maxShield * 0.5, dmg);
      dmg = Math.max(0, dmg - absorbed - Math.floor(this.stats.maxShield * 0.3));
      this.stats.shield = Math.max(0, this.stats.shield - 2);
    }
    this.stats.hp -= dmg;
    this.invuln = 600;
    this.setTint(C.crimsonBright);
    this.scene.time.delayedCall(120, () => this.clearTint());
    if (this.stats.hp <= 0) {
      this.stats.hp = 0;
      return true;
    }
    return false;
  }

  heal(amount: number): void {
    this.stats.hp = Math.min(this.stats.maxHp, this.stats.hp + amount);
  }

  destroy(fromScene?: boolean): void {
    this.attackHitbox?.destroy();
    this.blockGfx?.destroy();
    super.destroy(fromScene);
  }
}
