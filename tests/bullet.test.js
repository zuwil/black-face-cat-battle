import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Bullet, createPawBlast } from '../js/bullet.js';
import { CONFIG } from '../js/config.js';

describe('Bullet', () => {
  it('moves upward each update', () => {
    const b = new Bullet(100, 200, 0, -CONFIG.BULLET_SPEED, 8, 8);
    b.update();
    assert.equal(b.y, 200 - CONFIG.BULLET_SPEED);
  });

  it('is offscreen when above canvas', () => {
    const b = new Bullet(100, -10, 0, -5, 8, 8);
    assert.equal(b.isOffscreen(), true);
  });
});

describe('createPawBlast', () => {
  it('creates 1 bullet at level 1', () => {
    const bullets = createPawBlast(100, 200, 1);
    assert.equal(bullets.length, 1);
    assert.equal(bullets[0].dy, -CONFIG.BULLET_SPEED);
    assert.equal(bullets[0].dx, 0);
  });

  it('creates 2 bullets at level 2', () => {
    const bullets = createPawBlast(100, 200, 2);
    assert.equal(bullets.length, 2);
    assert.ok(bullets[0].dx < 0);
    assert.ok(bullets[1].dx > 0);
  });

  it('creates 3 bullets at level 3 with larger size', () => {
    const bullets = createPawBlast(100, 200, 3);
    assert.equal(bullets.length, 3);
    assert.equal(bullets[0].dx, 0);
    assert.ok(bullets[0].width > 8);
  });
});
