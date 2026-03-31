import { CONFIG } from './config.js';

export class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.POWERUP_WIDTH;
    this.height = CONFIG.POWERUP_HEIGHT;
  }

  update() {
    this.y += CONFIG.POWERUP_SPEED;
  }

  isOffscreen() {
    return this.y > CONFIG.CANVAS_HEIGHT + 10;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

export function shouldDropPowerUp() {
  return Math.random() < CONFIG.POWERUP_DROP_CHANCE;
}
