import * as THREE from 'three';

export type CreatureKind = 'wolf' | 'boar';

export class Creature {
  kind: CreatureKind;
  mesh: THREE.Group;
  hp: number;
  maxHp: number;
  torpor = 0;
  maxTorpor: number;
  unconscious = false;
  taming = 0;
  tamed = false;
  follow = false;
  rideable: boolean;
  home: THREE.Vector3;
  attackCd = 0;
  feedCd = 0;
  radius = 0.7;
  speed: number;
  damage: number;

  constructor(kind: CreatureKind, mesh: THREE.Group, x: number, z: number) {
    this.kind = kind;
    this.mesh = mesh;
    mesh.position.set(x, 0, z);
    this.home = new THREE.Vector3(x, 0, z);
    this.maxHp = kind === 'boar' ? 120 : 80;
    this.hp = this.maxHp;
    this.maxTorpor = kind === 'boar' ? 100 : 70;
    this.rideable = kind === 'wolf' || kind === 'boar';
    this.speed = kind === 'wolf' ? 6.5 : 5.2;
    this.damage = kind === 'boar' ? 14 : 10;
  }

  get position() {
    return this.mesh.position;
  }

  applyTorpor(n: number) {
    if (this.tamed) return;
    this.torpor = Math.min(this.maxTorpor, this.torpor + n);
    if (this.torpor >= this.maxTorpor) {
      this.unconscious = true;
      this.mesh.rotation.z = Math.PI / 2;
    }
  }

  feed(amount: number): boolean {
    if (!this.unconscious || this.tamed) return false;
    this.taming = Math.min(100, this.taming + amount);
    this.feedCd = 1.2;
    if (this.taming >= 100) {
      this.tamed = true;
      this.unconscious = false;
      this.follow = true;
      this.torpor = 0;
      this.mesh.rotation.z = 0;
      this.hp = this.maxHp;
      return true;
    }
    return false;
  }

  update(dt: number, playerPos: THREE.Vector3, resolve: (x: number, z: number, r: number) => { x: number; z: number }) {
    if (this.hp <= 0) {
      this.mesh.visible = false;
      return;
    }
    if (this.feedCd > 0) this.feedCd -= dt;
    if (this.attackCd > 0) this.attackCd -= dt;

    if (this.unconscious) {
      this.torpor = Math.max(0, this.torpor - 4 * dt);
      if (this.torpor <= 0) {
        this.unconscious = false;
        this.taming = Math.max(0, this.taming - 15);
        this.mesh.rotation.z = 0;
      }
      return;
    }

    if (this.tamed && this.follow) {
      const dx = playerPos.x - this.position.x;
      const dz = playerPos.z - this.position.z;
      const dist = Math.hypot(dx, dz);
      if (dist > 3.5) {
        const nx = this.position.x + (dx / dist) * this.speed * 0.9 * dt;
        const nz = this.position.z + (dz / dist) * this.speed * 0.9 * dt;
        const p = resolve(nx, nz, this.radius);
        this.position.x = p.x;
        this.position.z = p.z;
        this.mesh.rotation.y = Math.atan2(dx, dz);
      }
      return;
    }

    if (this.tamed) return;

    // wild: wander / aggro
    const dx = playerPos.x - this.position.x;
    const dz = playerPos.z - this.position.z;
    const dist = Math.hypot(dx, dz);
    if (dist < 14) {
      const nx = this.position.x + (dx / (dist || 1)) * this.speed * dt;
      const nz = this.position.z + (dz / (dist || 1)) * this.speed * dt;
      const p = resolve(nx, nz, this.radius);
      this.position.x = p.x;
      this.position.z = p.z;
      this.mesh.rotation.y = Math.atan2(dx, dz);
    } else {
      const ang = performance.now() * 0.0003 + this.home.x;
      const tx = this.home.x + Math.cos(ang) * 4;
      const tz = this.home.z + Math.sin(ang) * 4;
      const ddx = tx - this.position.x;
      const ddz = tz - this.position.z;
      const d = Math.hypot(ddx, ddz) || 1;
      const p = resolve(
        this.position.x + (ddx / d) * this.speed * 0.35 * dt,
        this.position.z + (ddz / d) * this.speed * 0.35 * dt,
        this.radius,
      );
      this.position.x = p.x;
      this.position.z = p.z;
    }
  }
}
