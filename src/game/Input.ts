export class Input {
  keys = new Set<string>();
  moveX = 0;
  moveZ = 0;
  lookYaw = 0;
  lookPitch = 0.35;
  attackPressed = false;
  interactPressed = false;
  inventoryPressed = false;
  mountPressed = false;
  whistlePressed = false;
  hotbarSlot: number | null = null;
  sprintHeld = false;
  pointerLocked = false;
  usingTouch = false;

  private canvas: HTMLCanvasElement;
  private touchSprint = false;
  private touchMoveActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    canvas.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('pointerlockchange', () => {
      this.pointerLocked = document.pointerLockElement === canvas;
    });
    this.bindTouch();
  }

  private onKeyDown = (e: KeyboardEvent) => {
    this.keys.add(e.code);
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault();
    }
    if (e.code === 'KeyE') this.interactPressed = true;
    if (e.code === 'KeyC' || e.code === 'Tab') {
      e.preventDefault();
      this.inventoryPressed = true;
    }
    if (e.code === 'KeyR') this.mountPressed = true;
    if (e.code === 'KeyQ') this.whistlePressed = true;
    if (e.code === 'Space') this.attackPressed = true;
    const slot = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'].indexOf(e.code);
    if (slot >= 0) this.hotbarSlot = slot;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keys.delete(e.code);
  };

  private onMouseDown = (e: MouseEvent) => {
    if (this.usingTouch) return;
    if (e.button === 0) {
      if (!this.pointerLocked) this.canvas.requestPointerLock();
      this.attackPressed = true;
    }
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.pointerLocked || this.usingTouch) return;
    this.lookYaw -= e.movementX * 0.0025;
    this.lookPitch -= e.movementY * 0.002;
    this.lookPitch = Math.max(0.12, Math.min(1.25, this.lookPitch));
  };

  private bindTouch() {
    const movePad = document.getElementById('move-pad');
    const lookPad = document.getElementById('look-pad');
    const moveKnob = document.getElementById('move-knob');
    const lookKnob = document.getElementById('look-knob');
    const btnAtk = document.getElementById('btn-attack');
    const btnSpr = document.getElementById('btn-block');
    const btnUse = document.getElementById('btn-interact');
    const btnInv = document.getElementById('btn-inv-touch');

    const bindPad = (
      el: HTMLElement | null,
      knob: HTMLElement | null,
      onMove: (nx: number, ny: number) => void,
      onEnd: () => void,
    ) => {
      if (!el) return;
      let pid: number | null = null;
      const radius = 36;
      const handle = (clientX: number, clientY: number) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        let dx = clientX - cx;
        let dy = clientY - cy;
        const len = Math.hypot(dx, dy) || 1;
        const clamped = Math.min(len, radius);
        dx = (dx / len) * clamped;
        dy = (dy / len) * clamped;
        if (knob) {
          knob.style.left = `${36 + dx - 23}px`;
          knob.style.top = `${36 + dy - 23}px`;
        }
        onMove(dx / radius, dy / radius);
      };
      el.addEventListener('pointerdown', (ev) => {
        this.usingTouch = true;
        pid = ev.pointerId;
        el.setPointerCapture(pid);
        handle(ev.clientX, ev.clientY);
      });
      el.addEventListener('pointermove', (ev) => {
        if (pid !== ev.pointerId) return;
        handle(ev.clientX, ev.clientY);
      });
      const end = (ev: PointerEvent) => {
        if (pid !== ev.pointerId) return;
        pid = null;
        if (knob) {
          knob.style.left = '36px';
          knob.style.top = '36px';
        }
        onEnd();
      };
      el.addEventListener('pointerup', end);
      el.addEventListener('pointercancel', end);
    };

    bindPad(movePad, moveKnob, (nx, ny) => {
      this.touchMoveActive = true;
      this.moveX = nx;
      this.moveZ = ny;
    }, () => {
      this.touchMoveActive = false;
      this.moveX = 0;
      this.moveZ = 0;
    });

    bindPad(lookPad, lookKnob, (nx, ny) => {
      this.lookYaw -= nx * 0.06;
      this.lookPitch = Math.max(0.12, Math.min(1.25, this.lookPitch + ny * 0.04));
    }, () => {});

    btnAtk?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.usingTouch = true;
      this.attackPressed = true;
    });
    btnSpr?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.touchSprint = true;
    });
    btnSpr?.addEventListener('pointerup', () => { this.touchSprint = false; });
    btnSpr?.addEventListener('pointercancel', () => { this.touchSprint = false; });
    btnUse?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.interactPressed = true;
    });
    btnInv?.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      this.inventoryPressed = true;
    });
  }

  beginFrame() {
    let kx = 0;
    let kz = 0;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) kz -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) kz += 1;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) kx -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) kx += 1;
    if (kx !== 0 || kz !== 0) {
      const len = Math.hypot(kx, kz) || 1;
      this.moveX = kx / len;
      this.moveZ = kz / len;
    } else if (!this.touchMoveActive) {
      this.moveX = 0;
      this.moveZ = 0;
    }
    this.sprintHeld = this.touchSprint || this.keys.has('ShiftLeft') || this.keys.has('ShiftRight');
  }

  consumeAttack() {
    const v = this.attackPressed;
    this.attackPressed = false;
    return v;
  }

  consumeInteract() {
    const v = this.interactPressed;
    this.interactPressed = false;
    return v;
  }

  consumeInventory() {
    const v = this.inventoryPressed;
    this.inventoryPressed = false;
    return v;
  }

  consumeMount() {
    const v = this.mountPressed;
    this.mountPressed = false;
    return v;
  }

  consumeWhistle() {
    const v = this.whistlePressed;
    this.whistlePressed = false;
    return v;
  }

  consumeHotbar(): number | null {
    const v = this.hotbarSlot;
    this.hotbarSlot = null;
    return v;
  }
}
