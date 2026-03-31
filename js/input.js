// js/input.js
import { CONFIG } from './config.js';

export class Input {
  constructor(canvas) {
    this.keys = {};

    // Touch state
    this.touchActive = false;
    this.touchX = 0;
    this.touchY = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
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

    // Touch events on canvas + document fallback
    if (canvas) {
      const onTouchStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        this.touchActive = true;
        this.touchStartX = t.clientX - rect.left;
        this.touchStartY = t.clientY - rect.top;
        this.touchX = this.touchStartX;
        this.touchY = this.touchStartY;
        this.touchDx = 0;
        this.touchDy = 0;
        this._tapped = true;
      };

      const onTouchMove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!this.touchActive) return;
        const t = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const newX = t.clientX - rect.left;
        const newY = t.clientY - rect.top;
        const scaleX = CONFIG.CANVAS_WIDTH / rect.width;
        const scaleY = CONFIG.CANVAS_HEIGHT / rect.height;
        this.touchDx = (newX - this.touchX) * scaleX;
        this.touchDy = (newY - this.touchY) * scaleY;
        this.touchX = newX;
        this.touchY = newY;
      };

      const onTouchEnd = (e) => {
        e.preventDefault();
        this.touchActive = false;
        this.touchDx = 0;
        this.touchDy = 0;
      };

      // Bind to canvas
      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, { passive: false });
      canvas.addEventListener('touchcancel', onTouchEnd);

      // Also bind to document as fallback for phones that don't
      // reliably fire touch events on canvas elements
      document.addEventListener('touchstart', onTouchStart, { passive: false });
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd, { passive: false });
      document.addEventListener('touchcancel', onTouchEnd);
    }
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

  // Consume touch movement delta (call once per frame)
  consumeTouch() {
    const dx = this.touchDx;
    const dy = this.touchDy;
    this.touchDx = 0;
    this.touchDy = 0;
    return { dx, dy, active: this.touchActive };
  }
}
