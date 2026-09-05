import * as THREE from 'three';

export class Enemy {
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  damage: number;
  speed: number;
  boss: boolean;
  attackCd = 0;
  radius: number;
  home: THREE.Vector3;
  alive = true;

  constructor(mesh: THREE.Group, x: number, z: number, boss = false) {
    this.mesh = mesh;
    mesh.position.set(x, 0, z);
    this.home = new THREE.Vector3(x, 0, z);
    this.boss = boss;
    this.maxHp = boss ? 280 : 70;
    this.hp = this.maxHp;
    this.damage = boss ? 22 : 10;
    this.speed = boss ? 4.8 : 4.2;
    this.radius = boss ? 1.0 : 0.55;
  }

  get position() {
    return this.mesh.position;
  }

  update(dt: number, playerPos: THREE.Vector3, resolve: (x: number, z: number, r: number) => { x: number; z: number }) {
    if (!this.alive) return;
    if (this.attackCd > 0) this.attackCd -= dt;
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    const aggro = this.boss ? 28 : 16;
    if (dist < aggro) {
      const nx = this.position.x + (dx / (dist || 1)) * this.speed * dt;
      const nz = this.position.z + (dz / (dist || 1)) * this.speed * dt;
      const p = resolve(nx, nz, this.radius);
      this.position.x = p.x;
      this.position.z = p.z;
      this.mesh.rotation.y = Math.atan2(dx, dz);
    }
  }

  kill() {
    this.alive = false;
    this.mesh.visible = false;
  }
}
