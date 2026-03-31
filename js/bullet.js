import { CONFIG } from './config.js';

export class Bullet {
  constructor(x, y, dx, dy, width, height) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = width;
    this.height = height;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  isOffscreen() {
    return (
      this.y + this.height < 0 ||
      this.y > CONFIG.CANVAS_HEIGHT ||
      this.x + this.width < 0 ||
      this.x > CONFIG.CANVAS_WIDTH
    );
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

export function createPawBlast(centerX, topY, level) {
  const speed = CONFIG.BULLET_SPEED;
  if (level === 1) {
    return [new Bullet(centerX - 4, topY, 0, -speed, 8, 8)];
  }
  if (level === 2) {
    return [
      new Bullet(centerX - 10, topY, -1, -speed, 8, 8),
      new Bullet(centerX + 2, topY, 1, -speed, 8, 8),
    ];
  }
  // level 3
  return [
    new Bullet(centerX - 6, topY, 0, -speed, 12, 12),
    new Bullet(centerX - 18, topY, -2, -speed, 12, 12),
    new Bullet(centerX + 6, topY, 2, -speed, 12, 12),
  ];
}
