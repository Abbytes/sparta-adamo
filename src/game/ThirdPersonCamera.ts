import * as THREE from 'three';

export class ThirdPersonCamera {
  camera: THREE.PerspectiveCamera;
  yaw = 0;
  pitch = 0.35;
  distance = 7;
  height = 2.2;

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 400);
  }

  setLook(yaw: number, pitch: number) {
    this.yaw = yaw;
    this.pitch = pitch;
  }

  update(target: THREE.Vector3) {
    const offset = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch) * this.distance,
      Math.sin(this.pitch) * this.distance + this.height * 0.15,
      Math.cos(this.yaw) * Math.cos(this.pitch) * this.distance,
    );
    this.camera.position.copy(target).add(offset);
    const lookAt = target.clone().add(new THREE.Vector3(0, 1.4, 0));
    this.camera.lookAt(lookAt);
  }

  resize(w: number, h: number) {
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Forward on XZ from yaw (camera behind player looking toward -offset). */
  forwardXZ(): THREE.Vector3 {
    // Player faces opposite of camera offset on ground
    return new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
  }

  rightXZ(): THREE.Vector3 {
    const f = this.forwardXZ();
    return new THREE.Vector3(-f.z, 0, f.x);
  }
}
