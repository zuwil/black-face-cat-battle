import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PowerUp, shouldDropPowerUp } from '../js/powerup.js';
import { CONFIG } from '../js/config.js';

describe('PowerUp', () => {
  it('falls downward', () => {
    const p = new PowerUp(100, 50);
    const startY = p.y;
    p.update();
    assert.equal(p.y, startY + CONFIG.POWERUP_SPEED);
  });

  it('is offscreen when below canvas', () => {
    const p = new PowerUp(100, CONFIG.CANVAS_HEIGHT + 30);
    assert.equal(p.isOffscreen(), true);
  });

  it('has correct hitbox', () => {
    const p = new PowerUp(100, 50);
    assert.deepEqual(p.hitbox, {
      x: 100,
      y: 50,
      width: CONFIG.POWERUP_WIDTH,
      height: CONFIG.POWERUP_HEIGHT,
    });
  });
});

describe('shouldDropPowerUp', () => {
  it('returns boolean', () => {
    const result = shouldDropPowerUp();
    assert.equal(typeof result, 'boolean');
  });
});
