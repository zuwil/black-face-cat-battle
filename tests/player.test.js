import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Player } from '../js/player.js';
import { CONFIG } from '../js/config.js';

describe('Player', () => {
  it('initializes at bottom center', () => {
    const p = new Player();
    assert.equal(p.x, CONFIG.CANVAS_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2);
    assert.equal(p.y, CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_HEIGHT - 20);
    assert.equal(p.lives, CONFIG.PLAYER_LIVES);
    assert.equal(p.level, 1);
  });

  it('moves left when input.left is true', () => {
    const p = new Player();
    const startX = p.x;
    p.update({ left: true, right: false, up: false, down: false });
    assert.equal(p.x, startX - CONFIG.PLAYER_SPEED);
  });

  it('does not move past left wall', () => {
    const p = new Player();
    p.x = 1;
    p.update({ left: true, right: false, up: false, down: false });
    assert.equal(p.x, 0);
  });

  it('does not move past right wall', () => {
    const p = new Player();
    p.x = CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_WIDTH - 1;
    p.update({ left: false, right: true, up: false, down: false });
    assert.equal(p.x, CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_WIDTH);
  });

  it('levels up when upgrading (max 3)', () => {
    const p = new Player();
    assert.equal(p.level, 1);
    p.upgrade();
    assert.equal(p.level, 2);
    p.upgrade();
    assert.equal(p.level, 3);
    p.upgrade();
    assert.equal(p.level, 3);
  });

  it('loses a level when hit (min 1)', () => {
    const p = new Player();
    p.level = 2;
    p.hit(Date.now());
    assert.equal(p.level, 1);
    assert.equal(p.lives, CONFIG.PLAYER_LIVES - 1);
  });

  it('is invincible after being hit', () => {
    const p = new Player();
    const now = Date.now();
    p.hit(now);
    assert.equal(p.isInvincible(now + 100), true);
    assert.equal(p.isInvincible(now + CONFIG.PLAYER_INVINCIBLE_MS + 1), false);
  });

  it('returns hitbox smaller than sprite', () => {
    const p = new Player();
    const hb = p.hitbox;
    const s = CONFIG.PLAYER_HITBOX_SHRINK;
    assert.equal(hb.width, CONFIG.PLAYER_WIDTH - s * 2);
    assert.equal(hb.height, CONFIG.PLAYER_HEIGHT - s * 2);
    assert.equal(hb.x, p.x + s);
    assert.equal(hb.y, p.y + s);
  });
});
