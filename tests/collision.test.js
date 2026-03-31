import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { checkCollision } from '../js/collision.js';

describe('checkCollision', () => {
  it('returns true when two rects overlap', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: 5, width: 10, height: 10 };
    assert.equal(checkCollision(a, b), true);
  });

  it('returns false when rects do not overlap', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 20, y: 20, width: 10, height: 10 };
    assert.equal(checkCollision(a, b), false);
  });

  it('returns false when rects touch edges exactly', () => {
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 10, y: 0, width: 10, height: 10 };
    assert.equal(checkCollision(a, b), false);
  });

  it('returns true when one rect is inside another', () => {
    const a = { x: 0, y: 0, width: 100, height: 100 };
    const b = { x: 10, y: 10, width: 5, height: 5 };
    assert.equal(checkCollision(a, b), true);
  });
});
