// js/hud.js
import { CONFIG } from './config.js';

export class HUD {
  draw(ctx, score, lives, level, bossHp) {
    ctx.save();
    ctx.font = '14px monospace';

    // Score (top-left)
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.fillText(`SCORE: ${score}`, 10, 22);

    // Lives (top-right)
    ctx.textAlign = 'right';
    for (let i = 0; i < lives; i++) {
      this._drawMiniCat(ctx, CONFIG.CANVAS_WIDTH - 20 - i * 22, 8);
    }

    // Paw level (bottom-left)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffaaaa';
    ctx.fillText(`PAW Lv.${level}`, 10, CONFIG.CANVAS_HEIGHT - 10);

    // Boss HP bar (if boss is active)
    if (bossHp !== null) {
      const barWidth = 200;
      const barHeight = 8;
      const barX = (CONFIG.CANVAS_WIDTH - barWidth) / 2;
      const barY = 30;
      const hpRatio = Math.max(0, bossHp / CONFIG.BOSS_HP);

      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barWidth, barHeight);
      ctx.fillStyle = hpRatio > 0.5 ? '#4a4' : hpRatio > 0.25 ? '#aa4' : '#a44';
      ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);
      ctx.strokeStyle = '#fff';
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }

    ctx.restore();
  }

  _drawMiniCat(ctx, x, y) {
    // Tiny 10x10 cat head icon
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x, y, 10, 10);
    ctx.fillStyle = '#ffee55';
    ctx.fillRect(x + 2, y + 3, 2, 2);
    ctx.fillRect(x + 6, y + 3, 2, 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(x + 1, y - 3, 3, 4);
    ctx.fillRect(x + 6, y - 3, 3, 4);
  }
}
