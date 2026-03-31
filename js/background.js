// js/background.js
import { CONFIG } from './config.js';

export class Background {
  constructor() {
    this.scrollY = 0;
    this.scrollSpeed = 0.5;
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * CONFIG.CANVAS_HEIGHT,
        width: 40 + Math.random() * 60,
        height: 15 + Math.random() * 15,
        speed: 0.2 + Math.random() * 0.3,
      });
    }
  }

  update() {
    this.scrollY += this.scrollSpeed;
    for (const cloud of this.clouds) {
      cloud.y += cloud.speed;
      if (cloud.y > CONFIG.CANVAS_HEIGHT + 20) {
        cloud.y = -cloud.height;
        cloud.x = Math.random() * CONFIG.CANVAS_WIDTH;
      }
    }
  }

  draw(ctx) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#E0F0FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (const cloud of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + cloud.width / 2,
        cloud.y + cloud.height / 2,
        cloud.width / 2,
        cloud.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}
