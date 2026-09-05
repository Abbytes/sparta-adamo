import Phaser from 'phaser';
import { C } from '../utils/colors';
import { clearSave } from '../utils/SaveSystem';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  create(): void {
    const { width, height } = this.scale;
    this.add.rectangle(0, 0, width, height, 0x0a1510).setOrigin(0);

    this.add.image(width / 2 - 40, 300, 'player').setScale(3);
    this.add.image(width / 2 + 30, 310, 'follower').setScale(2.2);
    this.add.image(width / 2 + 70, 315, 'follower').setScale(2);

    this.add
      .text(width / 2, 100, 'VICTORY', {
        fontFamily: 'Georgia',
        fontSize: '56px',
        color: '#d4af37',
        stroke: '#8b0000',
        strokeThickness: 5,
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, 170, 'The War-Queen falls. The outpost is ours.', {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#e8dcc8',
      })
      .setOrigin(0.5);

    this.add
      .text(
        width / 2,
        220,
        'From scrap and blood, Commander Adamo forged a tribe.\nSparta rises once more among the wilds.',
        {
          fontFamily: 'Georgia',
          fontSize: '14px',
          color: '#8a7a6a',
          align: 'center',
        }
      )
      .setOrigin(0.5);

    const bg = this.add.rectangle(0, 0, 240, 44, C.bronzeDark).setStrokeStyle(2, C.gold);
    const txt = this.add.text(0, 0, 'RETURN TO TITLE', { fontFamily: 'Georgia', fontSize: '16px', color: '#e8dcc8' }).setOrigin(0.5);
    const btn = this.add.container(width / 2, 420, [bg, txt]).setSize(240, 44).setInteractive({ useHandCursor: true });
    btn.on('pointerover', () => bg.setFillStyle(C.crimson));
    btn.on('pointerout', () => bg.setFillStyle(C.bronzeDark));
    btn.on('pointerdown', () => {
      clearSave();
      this.scene.start('TitleScene');
    });
  }
}
