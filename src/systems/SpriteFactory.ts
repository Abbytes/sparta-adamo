import Phaser from 'phaser';
import { C } from '../utils/colors';

/** Procedural geometric sprites — no external art assets needed */
export class SpriteFactory {
  static generate(scene: Phaser.Scene): void {
    this.makePlayer(scene);
    this.makeEnemy(scene);
    this.makeQueen(scene);
    this.makeFollower(scene);
    this.makeNpc(scene);
    this.makeTiles(scene);
    this.makeProps(scene);
    this.makeItems(scene);
    this.makeFx(scene);
  }

  private static g(
    scene: Phaser.Scene,
    key: string,
    w: number,
    h: number,
    draw: (g: Phaser.GameObjects.Graphics) => void
  ): void {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0 });
    draw(g);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  private static makePlayer(scene: Phaser.Scene): void {
    this.g(scene, 'player', 28, 32, (g) => {
      // cape
      g.fillStyle(C.crimson);
      g.fillTriangle(4, 10, 2, 30, 14, 28);
      g.fillStyle(C.cape);
      g.fillTriangle(4, 12, 3, 28, 12, 26);
      // body bronze armor
      g.fillStyle(C.bronze);
      g.fillRect(8, 10, 14, 14);
      g.fillStyle(C.bronzeDark);
      g.fillRect(10, 12, 10, 10);
      // helmet crest
      g.fillStyle(C.crimsonBright);
      g.fillRect(12, 0, 6, 6);
      g.fillStyle(C.bronze);
      g.fillCircle(15, 8, 7);
      g.fillStyle(C.bronzeDark);
      g.fillRect(10, 6, 10, 4);
      // eyes slit
      g.fillStyle(C.black);
      g.fillRect(11, 7, 8, 2);
      // legs
      g.fillStyle(C.bronzeDark);
      g.fillRect(9, 24, 5, 8);
      g.fillRect(16, 24, 5, 8);
      // spear
      g.fillStyle(C.steel);
      g.fillRect(24, 2, 2, 28);
      g.fillStyle(C.bronzeLight);
      g.fillTriangle(22, 2, 28, 2, 25, -2);
    });
  }

  private static makeEnemy(scene: Phaser.Scene): void {
    this.g(scene, 'enemy', 26, 28, (g) => {
      g.fillStyle(C.momTribe);
      g.fillRect(6, 8, 14, 14);
      g.fillStyle(C.momBright);
      g.fillCircle(13, 7, 7);
      g.fillStyle(C.black);
      g.fillCircle(10, 6, 2);
      g.fillCircle(16, 6, 2);
      // wild hair
      g.fillStyle(C.momBright);
      g.fillTriangle(6, 4, 4, -2, 10, 4);
      g.fillTriangle(16, 4, 20, -2, 22, 4);
      // club
      g.fillStyle(C.trunk);
      g.fillRect(20, 10, 4, 14);
      g.fillStyle(C.rock);
      g.fillCircle(22, 8, 5);
      // legs
      g.fillStyle(C.momTribe);
      g.fillRect(7, 22, 5, 6);
      g.fillRect(14, 22, 5, 6);
    });
  }

  private static makeQueen(scene: Phaser.Scene): void {
    this.g(scene, 'queen', 40, 44, (g) => {
      // cloak
      g.fillStyle(C.momTribe);
      g.fillTriangle(4, 14, 0, 42, 20, 38);
      g.fillTriangle(36, 14, 40, 42, 20, 38);
      // armor body
      g.fillStyle(C.momBright);
      g.fillRect(10, 14, 20, 18);
      g.fillStyle(0x4a1040);
      g.fillRect(12, 16, 16, 14);
      // crown
      g.fillStyle(C.gold);
      g.fillRect(10, 2, 20, 6);
      g.fillTriangle(10, 2, 14, -4, 18, 2);
      g.fillTriangle(18, 2, 20, -6, 22, 2);
      g.fillTriangle(22, 2, 26, -4, 30, 2);
      // head
      g.fillStyle(0xd4a0c0);
      g.fillCircle(20, 10, 8);
      g.fillStyle(C.crimsonBright);
      g.fillCircle(16, 9, 2);
      g.fillCircle(24, 9, 2);
      // staff
      g.fillStyle(C.gold);
      g.fillRect(34, 0, 3, 40);
      g.fillStyle(C.crimsonBright);
      g.fillCircle(35, 2, 6);
      // legs
      g.fillStyle(0x4a1040);
      g.fillRect(12, 32, 6, 12);
      g.fillRect(22, 32, 6, 12);
    });
  }

  private static makeFollower(scene: Phaser.Scene): void {
    this.g(scene, 'follower', 24, 28, (g) => {
      g.fillStyle(C.bronze);
      g.fillRect(6, 10, 12, 12);
      g.fillStyle(C.crimson);
      g.fillTriangle(4, 10, 2, 26, 10, 24);
      g.fillStyle(C.bronzeLight);
      g.fillCircle(12, 7, 6);
      g.fillStyle(C.black);
      g.fillRect(9, 6, 6, 2);
      g.fillStyle(C.bronzeDark);
      g.fillRect(7, 22, 4, 6);
      g.fillRect(13, 22, 4, 6);
      g.fillStyle(C.steel);
      g.fillRect(20, 4, 2, 20);
    });
  }

  private static makeNpc(scene: Phaser.Scene): void {
    this.g(scene, 'npc', 24, 28, (g) => {
      g.fillStyle(0x5a4a3a);
      g.fillRect(6, 10, 12, 12);
      g.fillStyle(C.flesh);
      g.fillCircle(12, 7, 6);
      g.fillStyle(C.black);
      g.fillCircle(10, 6, 1.5);
      g.fillCircle(14, 6, 1.5);
      g.fillStyle(0x4a3a2a);
      g.fillRect(7, 22, 4, 6);
      g.fillRect(13, 22, 4, 6);
      // distress marker feel — torn cloak
      g.fillStyle(0x6a5a4a);
      g.fillTriangle(4, 12, 2, 24, 8, 20);
    });
  }

  private static makeTiles(scene: Phaser.Scene): void {
    const tile = (key: string, color: number, accent?: number) => {
      this.g(scene, key, 32, 32, (g) => {
        g.fillStyle(color);
        g.fillRect(0, 0, 32, 32);
        if (accent !== undefined) {
          g.fillStyle(accent, 0.35);
          g.fillRect(2, 2, 6, 6);
          g.fillRect(18, 14, 8, 4);
          g.fillRect(8, 22, 5, 5);
        }
      });
    };
    tile('tile_camp', C.camp, 0x5a4a3a);
    tile('tile_wilds', C.wilds, C.grassLight);
    tile('tile_mountain', C.mountain, C.rockDark);
    tile('tile_outpost', C.outpost, 0x5a3030);
    tile('tile_path', 0x5a4a35, 0x6a5a45);
  }

  private static makeProps(scene: Phaser.Scene): void {
    this.g(scene, 'tree', 36, 44, (g) => {
      g.fillStyle(C.trunk);
      g.fillRect(14, 28, 8, 16);
      g.fillStyle(C.tree);
      g.fillCircle(18, 18, 16);
      g.fillStyle(0x2a5a2a);
      g.fillCircle(12, 14, 10);
      g.fillCircle(24, 16, 10);
    });
    this.g(scene, 'rock', 28, 22, (g) => {
      g.fillStyle(C.rockDark);
      g.fillEllipse(14, 12, 26, 18);
      g.fillStyle(C.rock);
      g.fillEllipse(12, 10, 18, 12);
    });
    this.g(scene, 'anvil', 32, 24, (g) => {
      g.fillStyle(C.steel);
      g.fillRect(4, 8, 24, 10);
      g.fillRect(10, 18, 12, 6);
      g.fillStyle(0xaaaaaa);
      g.fillRect(2, 6, 28, 4);
    });
    this.g(scene, 'bench', 36, 20, (g) => {
      g.fillStyle(C.trunk);
      g.fillRect(2, 8, 32, 8);
      g.fillRect(4, 16, 4, 4);
      g.fillRect(28, 16, 4, 4);
      g.fillStyle(C.bronze);
      g.fillCircle(18, 6, 4);
    });
    this.g(scene, 'campfire', 24, 24, (g) => {
      g.fillStyle(C.trunk);
      g.fillRect(4, 16, 16, 4);
      g.fillStyle(0xff6600);
      g.fillTriangle(12, 2, 4, 16, 20, 16);
      g.fillStyle(0xffcc00);
      g.fillTriangle(12, 6, 8, 16, 16, 16);
    });
    this.g(scene, 'tent', 40, 32, (g) => {
      g.fillStyle(C.crimson);
      g.fillTriangle(20, 2, 2, 30, 38, 30);
      g.fillStyle(C.bronzeDark);
      g.fillRect(16, 18, 8, 12);
    });
    this.g(scene, 'outpost_flag', 20, 36, (g) => {
      g.fillStyle(C.steel);
      g.fillRect(2, 0, 3, 36);
      g.fillStyle(C.momTribe);
      g.fillTriangle(5, 2, 5, 16, 18, 9);
    });
  }

  private static makeItems(scene: Phaser.Scene): void {
    this.g(scene, 'pickup_bronze', 16, 16, (g) => {
      g.fillStyle(C.bronze);
      g.fillCircle(8, 8, 7);
      g.fillStyle(C.bronzeLight);
      g.fillCircle(6, 6, 3);
    });
    this.g(scene, 'pickup_herb', 16, 16, (g) => {
      g.fillStyle(0x3a8a3a);
      g.fillEllipse(8, 10, 10, 8);
      g.fillStyle(0x2a6a2a);
      g.fillRect(7, 2, 2, 10);
    });
    this.g(scene, 'pickup_wood', 16, 16, (g) => {
      g.fillStyle(C.trunk);
      g.fillRect(3, 4, 10, 8);
      g.fillStyle(0x6a4a30);
      g.fillRect(3, 6, 10, 2);
    });
  }

  private static makeFx(scene: Phaser.Scene): void {
    this.g(scene, 'slash', 32, 16, (g) => {
      g.fillStyle(C.bronzeLight, 0.9);
      g.fillTriangle(0, 8, 28, 0, 28, 16);
      g.fillStyle(C.white, 0.5);
      g.fillTriangle(8, 8, 28, 4, 28, 12);
    });
    this.g(scene, 'block_shield', 20, 24, (g) => {
      g.fillStyle(C.bronze);
      g.fillEllipse(10, 12, 18, 22);
      g.fillStyle(C.crimson);
      g.fillCircle(10, 12, 5);
    });
  }
}
