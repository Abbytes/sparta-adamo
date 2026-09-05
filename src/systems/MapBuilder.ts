import Phaser from 'phaser';
import { C } from '../utils/colors';

export interface ZoneInfo {
  name: string;
  rect: Phaser.Geom.Rectangle;
  color: number;
}

export interface MapResult {
  walls: Phaser.Physics.Arcade.StaticGroup;
  zones: ZoneInfo[];
  interactables: {
    anvil: Phaser.GameObjects.Zone;
    bench: Phaser.GameObjects.Zone;
    recruitSpot: Phaser.GameObjects.Zone;
    rescueNpc: Phaser.GameObjects.Zone;
    npcSprite: Phaser.GameObjects.Image;
  };
}

const TILE = 32;
/** Map is 40 x 30 tiles = 1280 x 960 */
export const MAP_W = 40;
export const MAP_H = 30;

/**
 * Zone layout (tile coords):
 * Camp: bottom-center (14-26, 22-29)
 * Wilds: center (8-32, 10-21)
 * Mountain Pass: top-left (0-14, 0-12)
 * Mom Tribe Outpost: top-right (26-39, 0-12)
 */
export function buildMap(scene: Phaser.Scene): MapResult {
  const walls = scene.physics.add.staticGroup();

  // paint ground tiles
  for (let ty = 0; ty < MAP_H; ty++) {
    for (let tx = 0; tx < MAP_W; tx++) {
      const zone = zoneAt(tx, ty);
      const key =
        zone === 'camp'
          ? 'tile_camp'
          : zone === 'outpost'
            ? 'tile_outpost'
            : zone === 'mountain'
              ? 'tile_mountain'
              : zone === 'path'
                ? 'tile_path'
                : 'tile_wilds';
      scene.add.image(tx * TILE + 16, ty * TILE + 16, key).setDepth(0);
    }
  }

  // zone labels (world space)
  const zones: ZoneInfo[] = [
    { name: 'Sparta Camp', rect: new Phaser.Geom.Rectangle(14 * TILE, 22 * TILE, 12 * TILE, 8 * TILE), color: C.camp },
    { name: 'The Wilds', rect: new Phaser.Geom.Rectangle(8 * TILE, 10 * TILE, 24 * TILE, 12 * TILE), color: C.wilds },
    { name: 'Mountain Pass', rect: new Phaser.Geom.Rectangle(0, 0, 14 * TILE, 12 * TILE), color: C.mountain },
    { name: 'Mom Tribe Outpost', rect: new Phaser.Geom.Rectangle(26 * TILE, 0, 14 * TILE, 12 * TILE), color: C.outpost },
  ];

  for (const z of zones) {
    scene.add
      .text(z.rect.centerX, z.rect.y + 18, z.name.toUpperCase(), {
        fontFamily: 'Georgia',
        fontSize: '14px',
        color: '#e8dcc8',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(2)
      .setAlpha(0.7);
  }

  // border walls
  for (let tx = 0; tx < MAP_W; tx++) {
    addWall(scene, walls, tx, 0);
    addWall(scene, walls, tx, MAP_H - 1);
  }
  for (let ty = 0; ty < MAP_H; ty++) {
    addWall(scene, walls, 0, ty);
    addWall(scene, walls, MAP_W - 1, ty);
  }

  // trees & rocks — decorative collision
  const trees: [number, number][] = [
    [3, 14], [5, 18], [7, 12], [9, 16], [11, 19],
    [18, 14], [20, 17], [22, 12], [24, 15], [28, 18],
    [32, 14], [34, 16], [36, 20], [4, 8], [6, 5],
    [10, 4], [12, 8], [16, 6], [2, 20], [35, 24],
  ];
  for (const [tx, ty] of trees) {
    const img = scene.add.image(tx * TILE + 16, ty * TILE + 10, 'tree').setDepth(6);
    const wall = walls.create(tx * TILE + 16, ty * TILE + 22, 'rock') as Phaser.Physics.Arcade.Sprite;
    wall.setVisible(false);
    wall.setSize(14, 12);
    wall.refreshBody();
    void img;
  }

  const rocks: [number, number][] = [
    [2, 3], [4, 2], [8, 3], [11, 2], [13, 5],
    [27, 3], [30, 2], [33, 4], [37, 3], [35, 8],
    [15, 11], [25, 13], [19, 20],
  ];
  for (const [tx, ty] of rocks) {
    scene.add.image(tx * TILE + 16, ty * TILE + 16, 'rock').setDepth(5);
    const wall = walls.create(tx * TILE + 16, ty * TILE + 16, 'rock') as Phaser.Physics.Arcade.Sprite;
    wall.setVisible(false);
    wall.setSize(20, 14);
    wall.refreshBody();
  }

  // camp props
  scene.add.image(18 * TILE, 25 * TILE, 'tent').setDepth(4);
  scene.add.image(22 * TILE, 25 * TILE, 'tent').setDepth(4);
  scene.add.image(20 * TILE, 26 * TILE, 'campfire').setDepth(5);

  const anvilImg = scene.add.image(16 * TILE, 27 * TILE, 'anvil').setDepth(5);
  const benchImg = scene.add.image(24 * TILE, 27 * TILE, 'bench').setDepth(5);

  // outpost flags
  scene.add.image(28 * TILE, 3 * TILE, 'outpost_flag').setDepth(5);
  scene.add.image(36 * TILE, 3 * TILE, 'outpost_flag').setDepth(5);
  scene.add.image(32 * TILE, 2 * TILE, 'tent').setDepth(4).setTint(C.momTribe);

  // path markers between zones
  for (let ty = 12; ty <= 22; ty++) {
    scene.add.image(20 * TILE + 16, ty * TILE + 16, 'tile_path').setDepth(1).setAlpha(0.5);
  }
  for (let tx = 14; tx <= 26; tx++) {
    scene.add.image(tx * TILE + 16, 8 * TILE + 16, 'tile_path').setDepth(1).setAlpha(0.4);
  }

  // interact zones
  const anvil = scene.add.zone(anvilImg.x, anvilImg.y, 48, 40);
  scene.physics.add.existing(anvil, true);

  const bench = scene.add.zone(benchImg.x, benchImg.y, 48, 40);
  scene.physics.add.existing(bench, true);

  // recruit spot near campfire (pay bronze)
  const recruitSpot = scene.add.zone(20 * TILE, 24 * TILE, 56, 48);
  scene.physics.add.existing(recruitSpot, true);
  scene.add
    .text(20 * TILE, 23 * TILE - 8, 'RECRUIT (E)', {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#d4af37',
      stroke: '#000',
      strokeThickness: 2,
    })
    .setOrigin(0.5)
    .setDepth(7);

  // rescue NPC in mountain pass
  const npcSprite = scene.add.image(5 * TILE, 6 * TILE, 'npc').setDepth(8);
  const rescueNpc = scene.add.zone(npcSprite.x, npcSprite.y, 48, 48);
  scene.physics.add.existing(rescueNpc, true);
  scene.add
    .text(npcSprite.x, npcSprite.y - 22, 'RESCUE (E)', {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#e8dcc8',
      stroke: '#000',
      strokeThickness: 2,
    })
    .setOrigin(0.5)
    .setDepth(7)
    .setName('rescueLabel');

  // crafting labels
  scene.add
    .text(anvilImg.x, anvilImg.y - 18, 'ANVIL (E)', {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#d4af37',
      stroke: '#000',
      strokeThickness: 2,
    })
    .setOrigin(0.5)
    .setDepth(7);
  scene.add
    .text(benchImg.x, benchImg.y - 16, 'BENCH (E)', {
      fontFamily: 'Georgia',
      fontSize: '11px',
      color: '#d4af37',
      stroke: '#000',
      strokeThickness: 2,
    })
    .setOrigin(0.5)
    .setDepth(7);

  return {
    walls,
    zones,
    interactables: { anvil, bench, recruitSpot, rescueNpc, npcSprite },
  };
}

function zoneAt(tx: number, ty: number): string {
  if (tx >= 14 && tx <= 25 && ty >= 22) return 'camp';
  if (tx >= 26 && ty <= 11) return 'outpost';
  if (tx <= 13 && ty <= 11) return 'mountain';
  if (tx >= 18 && tx <= 21 && ty >= 12 && ty <= 21) return 'path';
  return 'wilds';
}

function addWall(
  scene: Phaser.Scene,
  walls: Phaser.Physics.Arcade.StaticGroup,
  tx: number,
  ty: number
): void {
  const wall = walls.create(tx * TILE + 16, ty * TILE + 16, 'rock') as Phaser.Physics.Arcade.Sprite;
  wall.setVisible(false);
  wall.setSize(32, 32);
  wall.refreshBody();
  // visible border tint
  scene.add.rectangle(tx * TILE + 16, ty * TILE + 16, 32, 32, C.rockDark, 0.85).setDepth(3);
}
