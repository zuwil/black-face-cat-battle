import { CONFIG } from './config.js';
import { Bullet } from './bullet.js';

export class Boss {
  constructor() {
    this.width = CONFIG.BOSS_WIDTH;
    this.height = CONFIG.BOSS_HEIGHT;
    this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
    this.y = -this.height;
    this.targetY = 40;
    this.hp = CONFIG.BOSS_HP;
    this.phase = 1;
    this.direction = 1;
    this.entering = true;
    this.lastShotTime = 0;
    this.shotInterval = 800;
    this.chargeTimer = 0;
    this.charging = false;
    this.chargeTargetY = 0;
    this.canCharge = false;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  get dead() {
    return this.hp <= 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }

  update(frame, playerY) {
    if (this.hp <= CONFIG.BOSS_HP / 2) {
      this.phase = 2;
      this.canCharge = true;
    }

    if (this.entering) {
      this.y += 1;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entering = false;
      }
      return;
    }

    const speed = this.phase === 1 ? CONFIG.BOSS_SPEED_PHASE1 : CONFIG.BOSS_SPEED_PHASE2;

    if (this.charging) {
      this.y += CONFIG.BOSS_CHARGE_SPEED;
      if (this.y >= this.chargeTargetY) {
        this.charging = false;
        this.y = this.targetY;
        this.chargeTimer = frame;
      }
      return;
    }

    this.x += speed * this.direction;
    if (this.x <= 0) this.direction = 1;
    if (this.x + this.width >= CONFIG.CANVAS_WIDTH) this.direction = -1;

    if (this.phase === 2 && !this.charging && frame - this.chargeTimer > 180) {
      this.charging = true;
      this.chargeTargetY = playerY;
    }
  }

  tryShoot(now) {
    if (this.entering) return [];
    if (now - this.lastShotTime < this.shotInterval) return [];
    this.lastShotTime = now;

    const cx = this.x + this.width / 2;
    const by = this.y + this.height;
    const speed = CONFIG.BOSS_BULLET_SPEED;
    const bullets = [
      new Bullet(cx - 4, by, 0, speed, 10, 10),
      new Bullet(cx - 4, by, -1.5, speed, 10, 10),
      new Bullet(cx - 4, by, 1.5, speed, 10, 10),
    ];

    if (this.phase === 2) {
      bullets.push(new Bullet(cx - 4, by, -3, speed * 0.8, 10, 10));
      bullets.push(new Bullet(cx - 4, by, 3, speed * 0.8, 10, 10));
    }

    return bullets;
  }
}
