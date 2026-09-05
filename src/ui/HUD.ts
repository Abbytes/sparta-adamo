import Phaser from 'phaser';
import { PlayerStats, Inventory, QuestState } from '../utils/types';
import { C } from '../utils/colors';

export class HUD {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private hpBar!: Phaser.GameObjects.Graphics;
  private xpBar!: Phaser.GameObjects.Graphics;
  private hpText!: Phaser.GameObjects.Text;
  private levelText!: Phaser.GameObjects.Text;
  private matText!: Phaser.GameObjects.Text;
  private tribeText!: Phaser.GameObjects.Text;
  private objectiveText!: Phaser.GameObjects.Text;
  private zoneText!: Phaser.GameObjects.Text;
  private hintText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // backdrop panels
    const topBg = scene.add.rectangle(0, 0, 960, 72, C.black, 0.55).setOrigin(0, 0);
    const botBg = scene.add.rectangle(0, 600, 960, 40, C.black, 0.55).setOrigin(0, 0);
    this.container.add([topBg, botBg]);

    this.hpBar = scene.add.graphics();
    this.xpBar = scene.add.graphics();
    this.container.add([this.hpBar, this.xpBar]);

    this.hpText = scene.add.text(16, 10, '', {
      fontFamily: 'Georgia',
      fontSize: '14px',
      color: '#e8dcc8',
    });
    this.levelText = scene.add.text(16, 42, '', {
      fontFamily: 'Georgia',
      fontSize: '13px',
      color: '#d4af37',
    });
    this.matText = scene.add.text(280, 12, '', {
      fontFamily: 'Georgia',
      fontSize: '13px',
      color: '#e8dcc8',
    });
    this.tribeText = scene.add.text(280, 42, '', {
      fontFamily: 'Georgia',
      fontSize: '13px',
      color: '#c41e3a',
    });
    this.objectiveText = scene.add.text(520, 12, '', {
      fontFamily: 'Georgia',
      fontSize: '13px',
      color: '#e8dcc8',
      wordWrap: { width: 420 },
    });
    this.zoneText = scene.add.text(480, 610, '', {
      fontFamily: 'Georgia',
      fontSize: '14px',
      color: '#d4af37',
    }).setOrigin(0.5, 0);
    this.hintText = scene.add.text(16, 610, 'WASD move · SPACE/Click attack · SHIFT block · E interact · ESC save', {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#8a7a6a',
    });

    this.container.add([
      this.hpText,
      this.levelText,
      this.matText,
      this.tribeText,
      this.objectiveText,
      this.zoneText,
      this.hintText,
    ]);
  }

  update(
    stats: PlayerStats,
    inv: Inventory,
    tribeCount: number,
    quests: QuestState,
    zoneName: string,
    craftedSpear: boolean
  ): void {
    // HP bar
    this.hpBar.clear();
    this.hpBar.fillStyle(C.hpBg);
    this.hpBar.fillRect(16, 28, 180, 10);
    this.hpBar.fillStyle(C.hp);
    this.hpBar.fillRect(16, 28, 180 * Math.max(0, stats.hp / stats.maxHp), 10);
    if (stats.maxShield > 0) {
      this.hpBar.fillStyle(0x6688aa, 0.7);
      this.hpBar.fillRect(16, 28, 180 * Math.min(1, stats.shield / stats.maxShield) * 0.3, 10);
    }

    // XP bar
    this.xpBar.clear();
    this.xpBar.fillStyle(0x3a3020);
    this.xpBar.fillRect(16, 56, 180, 6);
    this.xpBar.fillStyle(C.xp);
    this.xpBar.fillRect(16, 56, 180 * Math.min(1, stats.xp / stats.xpToNext), 6);

    this.hpText.setText(`HP ${Math.ceil(stats.hp)} / ${stats.maxHp}`);
    this.levelText.setText(`LVL ${stats.level}  ·  DMG ${stats.damage}${craftedSpear ? ' ▲' : ''}  ·  SHD ${stats.maxShield}`);
    this.matText.setText(
      `Bronze Scrap: ${inv.bronze_scrap}   Herb: ${inv.herb}   Wood: ${inv.wood}   Bronze: ${inv.bronze}`
    );
    this.tribeText.setText(`Sparta Tribe: ${tribeCount} warrior${tribeCount === 1 ? '' : 's'}`);
    this.objectiveText.setText(`OBJECTIVE\n${this.currentObjective(quests)}`);
    this.zoneText.setText(`— ${zoneName} —`);
  }

  private currentObjective(q: QuestState): string {
    if (!q.gatheredMaterials) return '1/4 Gather materials in the Wilds (scrap, herb, wood)';
    if (!q.recruitedTwo) return '2/4 Recruit 2 followers (rescue NPC in mountains + hire at camp)';
    if (!q.clearedOutpost) return '3/4 Clear Mom Tribe grunts at the Outpost';
    if (!q.defeatedQueen) return '4/4 Defeat the War-Queen at Mom Tribe Outpost';
    return 'Victory — the outpost falls. Sparta rises.';
  }

  showToast(msg: string): void {
    const t = this.scene.add
      .text(480, 320, msg, {
        fontFamily: 'Georgia',
        fontSize: '18px',
        color: '#d4af37',
        backgroundColor: '#000000aa',
        padding: { x: 16, y: 10 },
        align: 'center',
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(200);
    this.scene.tweens.add({
      targets: t,
      alpha: 0,
      y: 280,
      duration: 1800,
      ease: 'Power2',
      onComplete: () => t.destroy(),
    });
  }
}
