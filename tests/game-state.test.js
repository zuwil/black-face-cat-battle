import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GameState } from '../js/game-state.js';

describe('GameState', () => {
  it('starts at title', () => {
    const gs = new GameState();
    assert.equal(gs.current, 'title');
  });

  it('transitions title -> playing', () => {
    const gs = new GameState();
    gs.startGame();
    assert.equal(gs.current, 'playing');
  });

  it('transitions playing -> boss', () => {
    const gs = new GameState();
    gs.startGame();
    gs.startBoss();
    assert.equal(gs.current, 'boss');
  });

  it('transitions boss -> win', () => {
    const gs = new GameState();
    gs.startGame();
    gs.startBoss();
    gs.win();
    assert.equal(gs.current, 'win');
  });

  it('transitions playing -> lose', () => {
    const gs = new GameState();
    gs.startGame();
    gs.lose();
    assert.equal(gs.current, 'lose');
  });

  it('transitions win -> title via restart', () => {
    const gs = new GameState();
    gs.startGame();
    gs.startBoss();
    gs.win();
    gs.restart();
    assert.equal(gs.current, 'title');
  });

  it('tracks score and kill count', () => {
    const gs = new GameState();
    gs.startGame();
    assert.equal(gs.score, 0);
    assert.equal(gs.killCount, 0);
    gs.addScore(100);
    gs.addKill();
    assert.equal(gs.score, 100);
    assert.equal(gs.killCount, 1);
  });
});
