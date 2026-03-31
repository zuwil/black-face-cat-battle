// js/background.js
import { CONFIG } from './config.js';

// Color temperature presets: [topColor, bottomColor, cloudOpacity, label]
const TEMP_PRESETS = [
  { top: '#1a1a3e', bottom: '#2d1b4e', cloud: 'rgba(100, 100, 180, 0.3)', label: '夜空' },
  { top: '#4a5568', bottom: '#718096', cloud: 'rgba(200, 200, 220, 0.4)', label: '陰天' },
  { top: '#87CEEB', bottom: '#E0F0FF', cloud: 'rgba(255, 255, 255, 0.6)', label: '晴天' },
  { top: '#ff9966', bottom: '#ffe0b2', cloud: 'rgba(255, 230, 200, 0.5)', label: '暖陽' },
  { top: '#ff6b6b', bottom: '#ffd93d', cloud: 'rgba(255, 200, 150, 0.4)', label: '夕陽' },
];

export class Background {
  constructor() {
    this.scrollY = 0;
    this.scrollSpeed = 0.5;
    this.tempIndex = 2; // default: 晴天
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

  get preset() {
    return TEMP_PRESETS[this.tempIndex];
  }

  get tempLabel() {
    return this.preset.label;
  }

  cycleTemp(direction) {
    this.tempIndex = (this.tempIndex + direction + TEMP_PRESETS.length) % TEMP_PRESETS.length;
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
    const p = this.preset;

    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    grad.addColorStop(0, p.top);
    grad.addColorStop(1, p.bottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = p.cloud;
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
