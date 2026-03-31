// js/input.js
export class Input {
  constructor() {
    this.keys = {};
    this._onKeyDown = (e) => {
      this.keys[e.key] = true;
      e.preventDefault();
    };
    this._onKeyUp = (e) => {
      this.keys[e.key] = false;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
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
    return Object.values(this.keys).some(Boolean);
  }

  consumeAnyKey() {
    const was = this.anyKey;
    if (was) this.keys = {};
    return was;
  }
}
