import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { DogEnemy, CatEnemy } from '../js/enemy.js';
import { CONFIG } from '../js/config.js';

describe('DogEnemy', () => {
  it('moves downward', () => {
    const d = new DogEnemy(100, 0);
    const startY = d.y;
    d.update(0);
    assert.ok(d.y > startY);
  });

  it('is offscreen when below canvas', () => {
    const d = new DogEnemy(100, CONFIG.CANVAS_HEIGHT + 50);
    assert.equal(d.isOffscreen(), true);
  });

  it('does not shoot', () => {
    const d = new DogEnemy(100, 0);
    const bullets = d.tryShoot(100, 300, Date.now());
    assert.equal(bullets.length, 0);
  });
});

describe('CatEnemy', () => {
  it('moves in zigzag pattern', () => {
    const c = new CatEnemy(100, 0);
    const positions = [];
    for (let i = 0; i < 120; i++) {
      c.update(i);
      positions.push(c.x);
    }
    const hasLeftMove = positions.some((x, i) => i > 0 && x < positions[i - 1]);
    const hasRightMove = positions.some((x, i) => i > 0 && x > positions[i - 1]);
    assert.ok(hasLeftMove, 'should move left at some point');
    assert.ok(hasRightMove, 'should move right at some point');
  });

  it('can shoot toward player', () => {
    const c = new CatEnemy(100, 100);
    c.lastShotTime = 0;
    const bullets = c.tryShoot(200, 400, 2000);
    assert.equal(bullets.length, 1);
    assert.ok(bullets[0].dy > 0, 'bullet should move downward');
  });
});
