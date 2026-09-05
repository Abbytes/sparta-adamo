import Phaser from 'phaser';
import { C } from '../utils/colors';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data: { reason?: string }): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x1a0505).setOrigin(0);

    this.add
      .text(width / 2, 180, 'FALLEN', {
        fontFamily: 'Georgia',
        fontSize: '56px',
        color: '#c41e3a',
        stroke: '#000',
        strokeThickness: 4,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 260, data.reason ?? 'Commander Adamo has fallen in battle.', {
        fontFamily: 'Georgia',
        fontSize: '16px',
        color: '#e8dcc8',
        align: 'center',
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 320, 'The bronze cools. The cape lies still.\nRise again — Sparta endures.', {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#8a7a6a',
        align: 'center',
      })
      .setOrigin(0.5);

    const bg = this.add.rectangle(0, 0, 220, 44, C.bronzeDark).setStrokeStyle(2, C.gold);
    const txt = this.add.text(0, 0, 'TRY AGAIN', { fontFamily: 'Georgia', fontSize: '18px', color: '#e8dcc8' }).setOrigin(0.5);
    const btn = this.add.container(width / 2, 420, [bg, txt]).setSize(220, 44).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => bg.setFillStyle(C.crimson));
    btn.on('pointerout', () => bg.setFillStyle(C.bronzeDark));
    btn.on('pointerdown', () => this.scene.start('TitleScene'));
  }
}
