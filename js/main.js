import { CONFIG } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#222';
ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
ctx.fillStyle = '#fff';
ctx.font = '20px monospace';
ctx.textAlign = 'center';
ctx.fillText('黑臉貓大作戰', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
