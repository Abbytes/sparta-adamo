import Phaser from 'phaser';
import { SpriteFactory } from '../systems/SpriteFactory';
import { hasSave, clearSave } from '../utils/SaveSystem';
import { C } from '../utils/colors';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    SpriteFactory.generate(this);

    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, C.dark).setOrigin(0);

    // decorative geometric backdrop
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(40, width - 40);
      const y = Phaser.Math.Between(80, height - 80);
      this.add.image(x, y, 'tree').setAlpha(0.15).setScale(Phaser.Math.FloatBetween(0.6, 1.2));
    }

    this.add.image(width / 2 - 80, height / 2 + 40, 'player').setScale(3);
    this.add.image(width / 2 + 100, height / 2 + 50, 'enemy').setScale(2.2).setAlpha(0.5);
    this.add.image(width / 2 + 160, height / 2 + 30, 'queen').setScale(1.8).setAlpha(0.35);

    this.add
      .text(width / 2, 90, 'SPARTA ADAMO', {
        fontFamily: 'Georgia',
        fontSize: '52px',
        color: '#d4af37',
        stroke: '#8b0000',
        strokeThickness: 6,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 150, 'Commander Adamo · Bronze & Crimson', {
        fontFamily: 'Georgia',
        fontSize: '16px',
        color: '#c41e3a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        200,
        'The Mom Tribe holds the mountain outpost.\nGather. Recruit. Forge. Reclaim Sparta.',
        {
          fontFamily: 'Georgia',
          fontSize: '15px',
          color: '#e8dcc8',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    const startBtn = this.makeButton(width / 2, 320, 'BEGIN CAMPAIGN', () => {
      this.scene.start('WorldScene', { loadSave: false });
    });

    if (hasSave()) {
      this.makeButton(width / 2, 380, 'CONTINUE', () => {
        this.scene.start('WorldScene', { loadSave: true });
      });
      this.makeButton(width / 2, 440, 'CLEAR SAVE', () => {
        clearSave();
        this.scene.restart();
      });
    }

    void startBtn;

    this.add
      .text(width / 2, height - 36, 'WASD / Arrows · Space Attack · Shift Block · E Interact', {
        fontFamily: 'Georgia',
        fontSize: '12px',
        color: '#8a7a6a',
      })
      .setOrigin(0.5);
  }

  private makeButton(x: number, y: number, label: string, onClick: () => void): Phaser.GameObjects.Container {
    const bg = this.add.rectangle(0, 0, 260, 44, C.bronzeDark, 0.95).setStrokeStyle(2, C.gold);
    const txt = this.add
      .text(0, 0, label, {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#e8dcc8',
      })
      .setOrigin(0.5);
    const c = this.add.container(x, y, [bg, txt]).setSize(260, 44).setInteractive({ useHandCursor: true });
    c.on('pointerover', () => bg.setFillStyle(C.crimson, 0.95));
    c.on('pointerout', () => bg.setFillStyle(C.bronzeDark, 0.95));
    c.on('pointerdown', onClick);
    return c;
  }
}
