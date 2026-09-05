import Phaser from 'phaser';
import { Enemy } from './Enemy';

export class Follower extends Phaser.Physics.Arcade.Sprite {
  private offsetAngle: number;
  private attackCd = 0;
  damage = 8;
  speed = 140;

  constructor(scene: Phaser.Scene, x: number, y: number, index: number) {
    super(scene, x, y, 'follower');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(9);
    this.offsetAngle = index * ((Math.PI * 2) / 3);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(12, 12);
    body.setOffset(6, 14);
  }

  updateFollow(
    player: Phaser.Physics.Arcade.Sprite,
    enemies: Enemy[],
    delta: number
  ): void {
    if (this.attackCd > 0) this.attackCd -= delta;

    // find nearest enemy in range
    let nearest: Enemy | null = null;
    let nearestDist = 120;
    for (const e of enemies) {
      if (e.isDead()) continue;
      const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = e;
      }
    }

    if (nearest && nearestDist < 100) {
      if (nearestDist < 32) {
        this.setVelocity(0);
        if (this.attackCd <= 0) {
          this.attackCd = 700;
          nearest.takeDamage(this.damage);
          this.setTint(0xffddaa);
          this.scene.time.delayedCall(80, () => this.clearTint());
        }
      } else {
        this.scene.physics.moveToObject(this, nearest, this.speed);
        this.setFlipX(nearest.x < this.x);
      }
    } else {
      const tx = player.x + Math.cos(this.offsetAngle) * 40;
      const ty = player.y + Math.sin(this.offsetAngle) * 40;
      const d = Phaser.Math.Distance.Between(this.x, this.y, tx, ty);
      if (d > 12) {
        this.scene.physics.moveTo(this, tx, ty, this.speed * 0.85);
      } else {
        this.setVelocity(0);
      }
      this.setFlipX(player.x < this.x);
    }
  }
}
