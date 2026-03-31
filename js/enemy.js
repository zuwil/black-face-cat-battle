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
    this.lastShotTime = 0;
    this.shotInterval = 2000 + Math.random() * 1500;
    this.shootChance = 0.4;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_DOG_SPEED;
    this.x += Math.sin((frame + this.wobbleOffset) * 0.05) * 0.8;
  }

  tryShoot(playerX, playerY, now) {
    if (now - this.lastShotTime < this.shotInterval) return [];
    if (Math.random() > this.shootChance) return [];
    this.lastShotTime = now;

    const cx = this.x + this.width / 2 - 4;
    const by = this.y + this.height;
    const speed = CONFIG.ENEMY_CAT_BULLET_SPEED * 0.8;
    // Slow straight drop
    return [new Bullet(cx, by, 0, speed, 8, 8)];
  }
}

// Shot pattern types for cat enemies
const SHOT_PATTERNS = ['aimed', 'spread3', 'burst', 'ring', 'wave'];

export class CatEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 1);
    this.type = 'cat';
    this.zigzagOffset = Math.random() * Math.PI * 2;
    this.lastShotTime = 0;
    this.shotInterval = 1200 + Math.random() * 800;
    this.pattern = SHOT_PATTERNS[Math.floor(Math.random() * SHOT_PATTERNS.length)];
    this.burstCount = 0;
    this.burstTimer = 0;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_CAT_SPEED;
    this.x += Math.sin((frame + this.zigzagOffset) * 0.08) * 2;
  }

  tryShoot(playerX, playerY, now) {
    // Handle burst pattern follow-up shots
    if (this.pattern === 'burst' && this.burstCount > 0 && now - this.burstTimer > 120) {
      this.burstCount--;
      this.burstTimer = now;
      return this._shootAimed(playerX, playerY, CONFIG.ENEMY_CAT_BULLET_SPEED * 1.2);
    }

    if (now - this.lastShotTime < this.shotInterval) return [];
    this.lastShotTime = now;

    const cx = this.x + this.width / 2 - 4;
    const by = this.y + this.height;
    const speed = CONFIG.ENEMY_CAT_BULLET_SPEED;

    switch (this.pattern) {
      case 'aimed':
        return this._shootAimed(playerX, playerY, speed);

      case 'spread3': {
        const angles = [-0.3, 0, 0.3];
        return angles.map(a => new Bullet(cx, by, Math.sin(a) * speed, Math.cos(a) * speed, 8, 8));
      }

      case 'burst':
        this.burstCount = 2;
        this.burstTimer = now;
        return this._shootAimed(playerX, playerY, speed);

      case 'ring': {
        const count = 6;
        const bullets = [];
        for (let i = 0; i < count; i++) {
          const angle = (Math.PI * 2 * i) / count;
          bullets.push(new Bullet(cx, by, Math.cos(angle) * speed * 0.8, Math.sin(angle) * speed * 0.8, 8, 8));
        }
        return bullets;
      }

      case 'wave': {
        const dx = playerX - this.x;
        const dy = playerY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const bx = (dx / dist) * speed;
        const by2 = (dy / dist) * speed;
        return [
          new Bullet(cx - 8, by, bx, by2, 8, 8),
          new Bullet(cx + 8, by, bx, by2, 8, 8),
        ];
      }

      default:
        return this._shootAimed(playerX, playerY, speed);
    }
  }

  _shootAimed(playerX, playerY, speed) {
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return [];
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
