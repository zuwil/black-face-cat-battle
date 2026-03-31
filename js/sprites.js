// js/sprites.js

// Helper: draw a grid of pixels from a 2D color map
function drawPixelArt(ctx, x, y, pixels, scale) {
  for (let row = 0; row < pixels.length; row++) {
    for (let col = 0; col < pixels[row].length; col++) {
      const color = pixels[row][col];
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
      }
    }
  }
}

const _ = null; // transparent
const K = '#222';     // black
const W = '#fff';     // white
const BR = '#8B5E3C'; // brown (Pomeranian)
const DB = '#5A3A1A'; // dark brown
const BK = '#1a1a1a'; // dark (black face)
const GR = '#aaa';    // gray
const PK = '#ffaaaa'; // pink
const OR = '#f4a460'; // orange
const YL = '#ffee55'; // yellow

// Black-face cat (player) - 16x16
const CAT_PIXELS = [
  [_, _, _, _, _, K, K, _, _, K, K, _, _, _, _, _],
  [_, _, _, _, K, BK, BK, K, K, BK, BK, K, _, _, _, _],
  [_, _, _, K, BK, BK, BK, BK, BK, BK, BK, BK, K, _, _, _],
  [_, _, K, BK, BK, W, W, BK, BK, W, W, BK, BK, K, _, _],
  [_, _, K, BK, W, YL, W, BK, BK, W, YL, W, BK, K, _, _],
  [_, _, K, BK, BK, BK, BK, BK, BK, BK, BK, BK, BK, K, _, _],
  [_, _, K, BK, BK, BK, PK, PK, BK, BK, BK, BK, K, _, _, _],
  [_, _, _, K, BK, BK, BK, BK, BK, BK, BK, K, _, _, _, _],
  [_, _, K, W, W, W, W, W, W, W, W, W, W, K, _, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, W, W, K, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, W, W, K, _],
  [_, K, W, W, W, W, W, W, W, W, W, W, W, W, K, _],
  [_, _, K, W, W, W, W, W, W, W, W, W, W, K, _, _],
  [_, _, _, K, K, W, W, _, _, W, W, K, K, _, _, _],
  [_, _, _, _, K, K, K, _, _, K, K, K, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Dog enemy - 14x14
const DOG_PIXELS = [
  [_, _, _, OR, OR, _, _, _, _, OR, OR, _, _, _],
  [_, _, OR, OR, OR, OR, _, _, OR, OR, OR, OR, _, _],
  [_, _, OR, OR, OR, OR, OR, OR, OR, OR, OR, OR, _, _],
  [_, OR, OR, OR, W, W, OR, OR, W, W, OR, OR, OR, _],
  [_, OR, OR, W, K, W, OR, OR, W, K, W, OR, OR, _],
  [_, OR, OR, OR, OR, OR, K, K, OR, OR, OR, OR, OR, _],
  [_, OR, OR, OR, OR, PK, PK, PK, OR, OR, OR, OR, _, _],
  [_, _, OR, OR, OR, OR, OR, OR, OR, OR, OR, _, _, _],
  [_, _, _, OR, OR, OR, OR, OR, OR, OR, _, _, _, _],
  [_, _, _, _, OR, OR, OR, OR, OR, _, _, _, _, _],
  [_, _, _, OR, OR, _, _, _, OR, OR, _, _, _, _],
  [_, _, _, OR, OR, _, _, _, OR, OR, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Cat enemy - 14x14
const ENEMY_CAT_PIXELS = [
  [_, _, GR, GR, _, _, _, _, _, _, GR, GR, _, _],
  [_, GR, GR, GR, GR, _, _, _, _, GR, GR, GR, GR, _],
  [_, GR, PK, GR, GR, GR, GR, GR, GR, GR, GR, PK, GR, _],
  [GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR],
  [GR, GR, GR, W, W, GR, GR, GR, GR, W, W, GR, GR, GR],
  [GR, GR, W, YL, W, GR, GR, GR, W, YL, W, GR, GR, GR],
  [GR, GR, GR, GR, GR, GR, PK, GR, GR, GR, GR, GR, GR, GR],
  [_, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, _],
  [_, _, GR, GR, GR, GR, GR, GR, GR, GR, GR, GR, _, _],
  [_, _, _, GR, GR, GR, GR, GR, GR, GR, GR, _, _, _],
  [_, _, GR, GR, _, _, _, _, _, _, GR, GR, _, _],
  [_, _, GR, GR, _, _, _, _, _, _, GR, GR, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Boss: Fat Pomeranian - 32x32 (drawn at 2x = 64px)
const BOSS_PIXELS = [
  [_,_,_,_,_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_,_],
  [_,_,_,_,_,BR,BR,DB,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,DB,BR,BR,_,_,_,_,_],
  [_,_,_,_,BR,BR,DB,DB,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,DB,DB,BR,BR,_,_,_,_,_],
  [_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_],
  [_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,BR,W,W,W,BR,BR,BR,BR,BR,BR,W,W,W,BR,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,W,W,W,W,W,BR,BR,BR,BR,W,W,W,W,W,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,W,W,K,K,W,BR,BR,BR,BR,W,K,K,W,W,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,W,W,K,K,W,BR,BR,BR,BR,W,K,K,W,W,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,BR,W,W,W,BR,BR,BR,BR,BR,BR,W,W,BR,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,K,K,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,PK,PK,PK,PK,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_],
  [_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_],
  [_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_],
  [_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_],
  [_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_,_],
  [_,_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,BR,BR,BR,BR,BR,K,K,K,K,K,K,K,K,BR,BR,BR,BR,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,BR,BR,BR,K,K,K,K,K,K,K,K,K,K,BR,BR,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,BR,BR,K,K,K,K,K,K,K,K,K,K,BR,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,_,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,BR,_,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,BR,BR,BR,_,_,_,_,_,_,_,BR,BR,BR,_,_,_,_,_,_,_,_,_,_,_],
  [_,_,_,_,_,_,_,_,BR,BR,BR,_,_,_,_,_,_,_,BR,BR,BR,_,_,_,_,_,_,_,_,_,_,_],
];

// Paw blast bullet - 8x8
const PAW_PIXELS = [
  [_, PK, _, _, _, PK, _, _],
  [PK, PK, _, _, _, PK, PK, _],
  [_, _, _, _, _, _, _, _],
  [_, _, PK, PK, PK, _, _, _],
  [_, PK, PK, PK, PK, PK, _, _],
  [_, PK, PK, PK, PK, PK, _, _],
  [_, _, PK, PK, PK, _, _, _],
  [_, _, _, _, _, _, _, _],
];

// Bone bullet (boss) - 10x10
const BONE_PIXELS = [
  [_, _, W, W, _, _, W, W, _, _],
  [_, W, W, W, W, W, W, W, W, _],
  [_, _, W, W, W, W, W, W, _, _],
  [_, _, _, _, W, W, _, _, _, _],
  [_, _, _, _, W, W, _, _, _, _],
  [_, _, _, _, W, W, _, _, _, _],
  [_, _, _, _, W, W, _, _, _, _],
  [_, _, W, W, W, W, W, W, _, _],
  [_, W, W, W, W, W, W, W, W, _],
  [_, _, W, W, _, _, W, W, _, _],
];

// Furball (cat enemy bullet) - 8x8 (bright magenta/red for visibility)
const FM = '#ff44cc'; // furball magenta
const FR = '#ff2222'; // furball red core
const FURBALL_PIXELS = [
  [_, _, FM, FM, FM, _, _, _],
  [_, FM, FR, FR, FR, FM, _, _],
  [FM, FR, FM, FR, FM, FR, FM, _],
  [FM, FR, FR, FR, FR, FR, FM, _],
  [FM, FR, FM, FR, FM, FR, FM, _],
  [_, FM, FR, FR, FR, FM, _, _],
  [_, _, FM, FM, FM, _, _, _],
  [_, _, _, _, _, _, _, _],
];

// Power-up (glowing paw pad) - 10x10
const POWERUP_PIXELS = [
  [_, _, YL, YL, _, _, YL, YL, _, _],
  [_, YL, YL, YL, _, YL, YL, YL, _, _],
  [_, _, YL, _, _, _, YL, _, _, _],
  [_, _, _, PK, PK, PK, _, _, _, _],
  [_, _, PK, PK, PK, PK, PK, _, _, _],
  [_, _, PK, PK, PK, PK, PK, _, _, _],
  [_, _, PK, PK, PK, PK, PK, _, _, _],
  [_, _, _, PK, PK, PK, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _],
  [_, _, _, _, _, _, _, _, _, _],
];

export function drawCat(ctx, x, y) {
  drawPixelArt(ctx, x, y, CAT_PIXELS, 2);
}

export function drawDogEnemy(ctx, x, y) {
  drawPixelArt(ctx, x, y, DOG_PIXELS, 2);
}

export function drawCatEnemy(ctx, x, y) {
  drawPixelArt(ctx, x, y, ENEMY_CAT_PIXELS, 2);
}

export function drawBoss(ctx, x, y) {
  drawPixelArt(ctx, x, y, BOSS_PIXELS, 2);
}

export function drawPaw(ctx, x, y, level) {
  const scale = level >= 3 ? 2 : 1;
  drawPixelArt(ctx, x, y, PAW_PIXELS, scale);
}

export function drawBone(ctx, x, y) {
  // Glow effect for visibility
  ctx.save();
  ctx.shadowColor = '#ff4444';
  ctx.shadowBlur = 8;
  drawPixelArt(ctx, x, y, BONE_PIXELS, 1);
  ctx.restore();
}

export function drawFurball(ctx, x, y, frame) {
  // Bright pulsing glow for visibility
  ctx.save();
  ctx.shadowColor = '#ff66ff';
  ctx.shadowBlur = 6 + Math.sin((frame || 0) * 0.2) * 3;
  drawPixelArt(ctx, x, y, FURBALL_PIXELS, 1);
  ctx.restore();
}

export function drawPowerUp(ctx, x, y, frame) {
  const pulse = Math.sin(frame * 0.1) * 0.3 + 0.7;
  ctx.globalAlpha = pulse;
  drawPixelArt(ctx, x, y, POWERUP_PIXELS, 2);
  ctx.globalAlpha = 1;
}

export function drawBossFlipped(ctx, x, y) {
  ctx.save();
  ctx.translate(x + 32, y + 32);
  ctx.rotate(Math.PI);
  drawPixelArt(ctx, -32, -32, BOSS_PIXELS, 2);
  ctx.restore();
}
