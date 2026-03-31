import { CONFIG } from './config.js';
import { Bullet } from './bullet.js';

class Enemy {
  constructor(x, y, hp) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ENEMY_WIDTH;
    this.height = CONFIG.ENEMY_HEIGHT;
    this.hp = hp;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  isOffscreen() {
    return this.y > CONFIG.CANVAS_HEIGHT + 20;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }
}

export class DogEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 1);
    this.type = 'dog';
    this.wobbleOffset = Math.random() * Math.PI * 2;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_DOG_SPEED;
    this.x += Math.sin((frame + this.wobbleOffset) * 0.05) * 0.8;
  }

  tryShoot() {
    return [];
  }
}

export class CatEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 1);
    this.type = 'cat';
    this.zigzagOffset = Math.random() * Math.PI * 2;
    this.lastShotTime = 0;
    this.shotInterval = 1500 + Math.random() * 1000;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_CAT_SPEED;
    this.x += Math.sin((frame + this.zigzagOffset) * 0.08) * 2;
  }

  tryShoot(playerX, playerY, now) {
    if (now - this.lastShotTime < this.shotInterval) return [];
    this.lastShotTime = now;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return [];

    const speed = CONFIG.ENEMY_CAT_BULLET_SPEED;
    return [
      new Bullet(
        this.x + this.width / 2 - 4,
        this.y + this.height,
        (dx / dist) * speed,
        (dy / dist) * speed,
        8,
        8
      ),
    ];
  }
}
