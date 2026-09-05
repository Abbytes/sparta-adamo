import Phaser from 'phaser';

export type MaterialType = 'bronze_scrap' | 'herb' | 'wood';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  material: MaterialType;
  amount: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    material: MaterialType,
    amount = 1
  ) {
    const tex =
      material === 'bronze_scrap'
        ? 'pickup_bronze'
        : material === 'herb'
          ? 'pickup_herb'
          : 'pickup_wood';
    super(scene, x, y, tex);
    this.material = material;
    this.amount = amount;
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setDepth(5);
    (this.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
    scene.tweens.add({
      targets: this,
      y: y - 4,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }
}
