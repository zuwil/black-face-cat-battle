// js/input.js
import { CONFIG } from './config.js';

export class Input {
  constructor(canvas) {
    this.keys = {};
    this.canvas = canvas;

    // Touch / pointer state
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
    this.touchDx = 0;
    this.touchDy = 0;
    this._tapped = false;

    // Keyboard
    this._onKeyDown = (e) => {
      this.keys[e.key] = true;
      e.preventDefault();
    };
    this._onKeyUp = (e) => {
      this.keys[e.key] = false;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);

    if (canvas) {
      this._bindTouch(canvas);
      this._bindPointer(canvas);
      this._bindClick(canvas);
    }
  }

  // --- Touch Events (Android Chrome, some iOS) ---
  _bindTouch(canvas) {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      this._onPointerDown(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const t = e.touches[0];
      this._onPointerMove(t.clientX, t.clientY);
    }, { passive: false });

    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      this._onPointerUp();
    }, { passive: false });

    canvas.addEventListener('touchcancel', () => {
      this._onPointerUp();
    });
  }

  // --- Pointer Events (iOS Safari 13+, modern browsers) ---
  _bindPointer(canvas) {
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') return; // handled by click
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      this._onPointerDown(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') return;
      e.preventDefault();
      this._onPointerMove(e.clientX, e.clientY);
    });

    canvas.addEventListener('pointerup', (e) => {
      if (e.pointerType === 'mouse') return;
      this._onPointerUp();
    });

    canvas.addEventListener('pointercancel', () => {
      this._onPointerUp();
    });
  }

  // --- Click fallback (tap-to-start on any device) ---
  _bindClick(canvas) {
    canvas.addEventListener('click', () => {
      this._tapped = true;
    });
  }

  // --- Shared pointer logic ---
  _onPointerDown(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    this.touchActive = true;
    this.touchX = clientX - rect.left;
    this.touchY = clientY - rect.top;
    this.touchDx = 0;
    this.touchDy = 0;
    this._tapped = true;
  }

  _onPointerMove(clientX, clientY) {
    if (!this.touchActive) return;
    const rect = this.canvas.getBoundingClientRect();
    const newX = clientX - rect.left;
    const newY = clientY - rect.top;
    const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
    const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
    this.touchDx += (newX - this.touchX) * scaleX;
    this.touchDy += (newY - this.touchY) * scaleY;
    this.touchX = newX;
    this.touchY = newY;
  }

  _onPointerUp() {
    this.touchActive = false;
    this.touchDx = 0;
    this.touchDy = 0;
  }

  isDown(key) {
    return !!this.keys[key];
  }

  get left() {
    return this.isDown('ArrowLeft') || this.isDown('a');
  }

  get right() {
    return this.isDown('ArrowRight') || this.isDown('d');
  }

  get up() {
    return this.isDown('ArrowUp') || this.isDown('w');
  }

  get down() {
    return this.isDown('ArrowDown') || this.isDown('s');
  }

  get shoot() {
    return this.isDown(' ');
  }

  get anyKey() {
    return Object.values(this.keys).some(Boolean) || this._tapped;
  }

  consumeAnyKey() {
    const was = this.anyKey;
    if (was) {
      this.keys = {};
      this._tapped = false;
    }
    return was;
  }

  consumeTouch() {
    const dx = this.touchDx;
    const dy = this.touchDy;
    this.touchDx = 0;
    this.touchDy = 0;
    return { dx, dy, active: this.touchActive };
  }
}
