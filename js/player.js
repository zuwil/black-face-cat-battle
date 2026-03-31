import { CONFIG } from './config.js';

export class Player {
  constructor() {
    this.width = CONFIG.PLAYER_WIDTH;
    this.height = CONFIG.PLAYER_HEIGHT;
    this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
    this.y = CONFIG.CANVAS_HEIGHT - this.height - 20;
    this.lives = CONFIG.PLAYER_LIVES;
    this.level = 1;
    this.invincibleUntil = 0;
    this.lastShotTime = 0;
  }

  update(input) {
    if (input.left) this.x -= CONFIG.PLAYER_SPEED;
    if (input.right) this.x += CONFIG.PLAYER_SPEED;
    if (input.up) this.y -= CONFIG.PLAYER_SPEED;
    if (input.down) this.y += CONFIG.PLAYER_SPEED;

    this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT - this.height, this.y));
  }

  get hitbox() {
    const s = CONFIG.PLAYER_HITBOX_SHRINK;
    return {
      x: this.x + s,
      y: this.y + s,
      width: this.width - s * 2,
      height: this.height - s * 2,
    };
  }

  canShoot(now) {
    return now - this.lastShotTime >= CONFIG.SHOOT_INTERVAL_MS;
  }

  shoot(now) {
    this.lastShotTime = now;
  }

  upgrade() {
    if (this.level < 3) this.level++;
  }

  hit(now) {
    this.lives--;
    if (this.level > 1) this.level--;
    this.invincibleUntil = now + CONFIG.PLAYER_INVINCIBLE_MS;
  }

  isInvincible(now) {
    return now < this.invincibleUntil;
  }

  get alive() {
    return this.lives > 0;
  }
}
