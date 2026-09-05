import * as THREE from 'three';
import type { AABB, ResourceKind, ZoneId } from '../utils/types';

export interface Obstacle {
  box: AABB;
  mesh: THREE.Object3D;
}

export interface ResourceNode {
  id: string;
  kind: ResourceKind;
  mesh: THREE.Object3D;
  hp: number;
  maxHp: number;
  position: THREE.Vector3;
  respawnAt: number;
}

export class World {
  scene: THREE.Scene;
  obstacles: Obstacle[] = [];
  nodes: ResourceNode[] = [];
  waterSpots: THREE.Vector3[] = [];
  groundSize = 220;
  private nodeId = 0;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.buildLighting();
    this.buildGround();
    this.buildDecor();
    this.buildResourceNodes();
    this.buildBorders();
    this.waterSpots.push(new THREE.Vector3(-15, 0, 22), new THREE.Vector3(40, 0, -15), new THREE.Vector3(-50, 0, -30));
    for (const w of this.waterSpots) {
      const pool = new THREE.Mesh(
        new THREE.CircleGeometry(3.5, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a6a9a, transparent: true, opacity: 0.75 }),
      );
      pool.rotation.x = -Math.PI / 2;
      pool.position.set(w.x, 0.06, w.z);
      this.scene.add(pool);
    }
  }

  private buildLighting() {
    this.scene.add(new THREE.HemisphereLight(0xb8d0ff, 0x3a2a18, 0.9));
    const sun = new THREE.DirectionalLight(0xffe2b8, 1.05);
    sun.position.set(50, 90, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    const cam = sun.shadow.camera;
    cam.left = -90; cam.right = 90; cam.top = 90; cam.bottom = -90;
    this.scene.add(sun);
    this.scene.background = new THREE.Color(0x7fa0b8);
    this.scene.fog = new THREE.Fog(0x7fa0b8, 75, 190);
  }

  private buildGround() {
    const geo = new THREE.PlaneGeometry(this.groundSize, this.groundSize, 36, 36);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const h = Math.sin(x * 0.07) * Math.cos(y * 0.06) * 0.4
        + Math.sin(x * 0.025 + y * 0.03) * 0.7;
      const boost = (x < -40 && y < -30) || (x > 30 && y < -40) ? 1.1 : 0;
      pos.setZ(i, h + boost);
    }
    geo.computeVertexNormals();
    const ground = new THREE.Mesh(
      geo,
      new THREE.MeshStandardMaterial({ color: 0x4a6b3a, flatShading: true, roughness: 0.95 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.addZoneTint(0, 32, 30, 0x6b8f4e);
    this.addZoneTint(0, -10, 48, 0x556b3a);
    this.addZoneTint(-60, -55, 36, 0x6a6a6a);
    this.addZoneTint(55, -60, 38, 0x7a4a3a);
  }

  private addZoneTint(x: number, z: number, r: number, color: number) {
    const m = new THREE.Mesh(
      new THREE.CircleGeometry(r, 20),
      new THREE.MeshStandardMaterial({ color, transparent: true, opacity: 0.2, flatShading: true }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, 0.07, z);
    this.scene.add(m);
  }

  addBoxObstacle(x: number, z: number, w: number, d: number, h: number, color: number) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({ color, flatShading: true }),
    );
    mesh.position.set(x, h / 2, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    this.scene.add(mesh);
    const pad = 0.15;
    this.obstacles.push({
      mesh,
      box: { minX: x - w / 2 - pad, maxX: x + w / 2 + pad, minZ: z - d / 2 - pad, maxZ: z + d / 2 + pad },
    });
    return mesh;
  }

  private buildDecor() {
    const rocks: Array<[number, number, number, number, number]> = [
      [-18, -8, 2.5, 2.5, 2.8], [22, -15, 3, 2, 2.4], [-45, -40, 4, 3, 4.5],
      [-70, -55, 3, 4, 3.8], [45, -45, 3, 3, 2.8], [70, -55, 4, 3, 3.2],
      [8, 40, 2, 2, 2.2], [-12, 45, 2, 2, 2], [50, -75, 3, 4, 3.5],
    ];
    for (const r of rocks) this.addBoxObstacle(r[0], r[1], r[2], r[3], r[4], 0x6a6558);

    // camp tents (visual)
    for (const [x, z] of [[-10, 38], [10, 40]] as const) {
      const tent = new THREE.Mesh(
        new THREE.ConeGeometry(2.2, 3.0, 4),
        new THREE.MeshStandardMaterial({ color: 0x8b1a1a, flatShading: true }),
      );
      tent.position.set(x, 1.5, z);
      this.scene.add(tent);
      this.obstacles.push({
        mesh: tent,
        box: { minX: x - 1.5, maxX: x + 1.5, minZ: z - 1.5, maxZ: z + 1.5 },
      });
    }
  }

  private addNode(kind: ResourceKind, x: number, z: number) {
    let mesh: THREE.Object3D;
    if (kind === 'wood') {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.45, 3.2, 6),
        new THREE.MeshStandardMaterial({ color: 0x6b4423, flatShading: true }),
      );
      trunk.position.y = 1.6;
      const leaves = new THREE.Mesh(
        new THREE.ConeGeometry(1.6, 2.4, 6),
        new THREE.MeshStandardMaterial({ color: 0x2d5a27, flatShading: true }),
      );
      leaves.position.y = 3.4;
      g.add(trunk, leaves);
      g.position.set(x, 0, z);
      mesh = g;
    } else if (kind === 'stone' || kind === 'metal') {
      mesh = new THREE.Mesh(
        new THREE.DodecahedronGeometry(kind === 'metal' ? 1.1 : 0.95, 0),
        new THREE.MeshStandardMaterial({
          color: kind === 'metal' ? 0x8a9aaa : 0x888880,
          flatShading: true,
          metalness: kind === 'metal' ? 0.55 : 0.1,
          roughness: 0.6,
        }),
      );
      mesh.position.set(x, 0.7, z);
    } else if (kind === 'fiber' || kind === 'berry') {
      mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.55, 6, 6),
        new THREE.MeshStandardMaterial({
          color: kind === 'berry' ? 0xb02040 : 0x6aaa3a,
          flatShading: true,
        }),
      );
      mesh.position.set(x, 0.55, z);
    } else {
      mesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.4, 0.6),
        new THREE.MeshStandardMaterial({ color: 0xaa5544, flatShading: true }),
      );
      mesh.position.set(x, 0.3, z);
    }
    this.scene.add(mesh);
    const id = `n${this.nodeId++}`;
    this.nodes.push({
      id,
      kind,
      mesh,
      hp: kind === 'metal' ? 40 : kind === 'stone' || kind === 'wood' ? 30 : 12,
      maxHp: kind === 'metal' ? 40 : kind === 'stone' || kind === 'wood' ? 30 : 12,
      position: new THREE.Vector3(x, 0, z),
      respawnAt: 0,
    });
  }

  private buildResourceNodes() {
    const wood: Array<[number, number]> = [
      [6, 18], [-8, 14], [14, 8], [-20, 5], [4, -6], [-12, -14], [28, -8],
      [-30, -20], [18, -22], [-5, -30], [35, 5], [-40, 0], [22, 20],
    ];
    const stone: Array<[number, number]> = [
      [10, 12], [-16, 20], [20, -4], [-25, -8], [8, -18], [-38, -35],
      [42, -30], [-55, -50], [60, -48], [0, -45],
    ];
    const metal: Array<[number, number]> = [
      [-62, -62], [-48, -70], [65, -70], [72, -52], [-70, -40],
    ];
    const fiber: Array<[number, number]> = [
      [2, 25], [-6, 22], [12, 24], [-14, 28], [5, 5], [-3, -10],
      [25, 12], [-22, -25], [30, -40], [48, -20],
    ];
    const berry: Array<[number, number]> = [
      [-4, 18], [8, 6], [-18, -4], [16, -14], [-28, -28], [38, -18],
    ];
    for (const [x, z] of wood) this.addNode('wood', x, z);
    for (const [x, z] of stone) this.addNode('stone', x, z);
    for (const [x, z] of metal) this.addNode('metal', x, z);
    for (const [x, z] of fiber) this.addNode('fiber', x, z);
    for (const [x, z] of berry) this.addNode('berry', x, z);
  }

  private buildBorders() {
    const half = this.groundSize / 2 - 2;
    const edges: AABB[] = [
      { minX: -half - 4, maxX: half + 4, minZ: -half - 4, maxZ: -half },
      { minX: -half - 4, maxX: half + 4, minZ: half, maxZ: half + 4 },
      { minX: -half - 4, maxX: -half, minZ: -half, maxZ: half },
      { minX: half, maxX: half + 4, minZ: -half, maxZ: half },
    ];
    for (const box of edges) this.obstacles.push({ mesh: new THREE.Object3D(), box });
  }

  makeAdamo(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.36, 0.95, 4, 8),
      new THREE.MeshStandardMaterial({ color: 0xb87333, flatShading: true }),
    );
    body.position.y = 1.15;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xe8c39e, flatShading: true }),
    );
    head.position.y = 2.0;
    g.add(head);
    const helm = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.45, 6),
      new THREE.MeshStandardMaterial({ color: 0xb87333, flatShading: true }),
    );
    helm.position.y = 2.28;
    g.add(helm);
    const cape = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 1.15, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x8b1a1a, flatShading: true }),
    );
    cape.position.set(0, 1.25, 0.38);
    g.add(cape);
    return g;
  }

  makeMomEnemy(boss = false): THREE.Group {
    const g = new THREE.Group();
    const s = boss ? 1.5 : 1;
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.38 * s, 0.95 * s, 4, 8),
      new THREE.MeshStandardMaterial({ color: boss ? 0x4a0020 : 0x6b2040, flatShading: true }),
    );
    body.position.y = 1.1 * s;
    body.castShadow = true;
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.3 * s, 8, 8),
      new THREE.MeshStandardMaterial({ color: 0xd4a574, flatShading: true }),
    );
    head.position.y = 1.95 * s;
    g.add(head);
    if (boss) {
      const crown = new THREE.Mesh(
        new THREE.ConeGeometry(0.42, 0.55, 5),
        new THREE.MeshStandardMaterial({ color: 0xd4a017, emissive: 0x442200 }),
      );
      crown.position.y = 2.45 * s;
      g.add(crown);
    }
    return g;
  }

  makeWolf(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.35, 0.9, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x6a6a75, flatShading: true }),
    );
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.7, 0);
    g.add(body);
    const head = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: 0x7a7a85, flatShading: true }),
    );
    head.position.set(0, 0.85, -0.7);
    g.add(head);
    return g;
  }

  makeBoar(): THREE.Group {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.5, 1.0, 4, 6),
      new THREE.MeshStandardMaterial({ color: 0x5a3a28, flatShading: true }),
    );
    body.rotation.z = Math.PI / 2;
    body.position.set(0, 0.75, 0);
    g.add(body);
    const tusk = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.45, 5),
      new THREE.MeshStandardMaterial({ color: 0xeeeeee, flatShading: true }),
    );
    tusk.rotation.x = Math.PI / 2;
    tusk.position.set(0.25, 0.7, -0.85);
    g.add(tusk);
    return g;
  }

  getZone(x: number, z: number): ZoneId {
    if (x >= -28 && x <= 28 && z >= 8 && z <= 55) return 'camp';
    if (x >= -90 && x <= -35 && z >= -90 && z <= -20) return 'pass';
    if (x >= 20 && x <= 90 && z >= -95 && z <= -25) return 'outpost';
    return 'wilds';
  }

  zoneLabel(z: ZoneId): string {
    switch (z) {
      case 'camp': return 'Sparta Camp';
      case 'wilds': return 'The Wilds';
      case 'pass': return 'Mountain Pass';
      case 'outpost': return 'Mom Tribe Outpost';
    }
  }

  resolveCollision(x: number, z: number, radius: number): { x: number; z: number } {
    let nx = x;
    let nz = z;
    for (const o of this.obstacles) {
      const { minX, maxX, minZ, maxZ } = o.box;
      const nearestX = Math.max(minX, Math.min(nx, maxX));
      const nearestZ = Math.max(minZ, Math.min(nz, maxZ));
      const dx = nx - nearestX;
      const dz = nz - nearestZ;
      const distSq = dx * dx + dz * dz;
      if (distSq < radius * radius) {
        const dist = Math.sqrt(distSq) || 0.0001;
        const push = radius - dist;
        nx += (dx / dist) * push;
        nz += (dz / dist) * push;
      }
    }
    const lim = this.groundSize / 2 - 3;
    return { x: Math.max(-lim, Math.min(lim, nx)), z: Math.max(-lim, Math.min(lim, nz)) };
  }

  updateNodes(now: number) {
    for (const n of this.nodes) {
      if (n.hp <= 0 && now >= n.respawnAt) {
        n.hp = n.maxHp;
        n.mesh.visible = true;
      }
    }
  }
}
