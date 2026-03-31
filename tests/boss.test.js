import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Boss } from '../js/boss.js';
import { CONFIG } from '../js/config.js';

describe('Boss', () => {
  it('starts in phase 1', () => {
    const b = new Boss();
    assert.equal(b.phase, 1);
    assert.equal(b.hp, CONFIG.BOSS_HP);
  });

  it('moves left-right in phase 1', () => {
    const b = new Boss();
    b.direction = 1;
    b.entering = false;
    b.y = b.targetY;
    const startX = b.x;
    b.update(0, 300);
    assert.ok(b.x !== startX);
  });

  it('switches to phase 2 at half HP', () => {
    const b = new Boss();
    b.entering = false;
    b.y = b.targetY;
    b.hp = CONFIG.BOSS_HP / 2;
    b.update(0, 300);
    assert.equal(b.phase, 2);
  });

  it('fires bone bullets', () => {
    const b = new Boss();
    b.entering = false;
    b.lastShotTime = 0;
    const bullets = b.tryShoot(2000);
    assert.ok(bullets.length > 0);
  });

  it('charges down in phase 2', () => {
    const b = new Boss();
    b.entering = false;
    b.y = b.targetY;
    b.hp = CONFIG.BOSS_HP * 0.3;
    b.update(0, 300);
    assert.equal(b.phase, 2);
    assert.ok(b.canCharge);
  });

  it('reports dead when hp <= 0', () => {
    const b = new Boss();
    b.hp = 1;
    assert.equal(b.takeDamage(1), true);
    assert.equal(b.dead, true);
  });
});
