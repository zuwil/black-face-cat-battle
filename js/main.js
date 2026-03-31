// js/main.js
import { CONFIG } from './config.js';
import { Input } from './input.js';
import { Player } from './player.js';
import { createPawBlast } from './bullet.js';
import { DogEnemy, CatEnemy } from './enemy.js';
import { Boss } from './boss.js';
import { PowerUp, shouldDropPowerUp } from './powerup.js';
import { checkCollision } from './collision.js';
import { GameState } from './game-state.js';
import { Background } from './background.js';
import { HUD } from './hud.js';
import {
  drawCat, drawDogEnemy, drawCatEnemy, drawBoss, drawBossFlipped,
  drawPaw, drawBone, drawFurball, drawPowerUp,
} from './sprites.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const input = new Input(canvas);
const hud = new HUD();

let state, player, background, boss;
let playerBullets, enemyBullets, enemies, powerups;
let frame, lastEnemySpawn;

function init() {
  state = new GameState();
  player = new Player();
  background = new Background();
  boss = null;
  playerBullets = [];
  enemyBullets = [];
  enemies = [];
  powerups = [];
  frame = 0;
  lastEnemySpawn = 0;
}

init();

let tempNotifyUntil = 0;

window.addEventListener('keydown', (e) => {
  if (e.key === '[') {
    background.cycleTemp(-1);
    tempNotifyUntil = performance.now() + 1500;
  } else if (e.key === ']') {
    background.cycleTemp(1);
    tempNotifyUntil = performance.now() + 1500;
  }
});

function spawnEnemy(now) {
  if (now - lastEnemySpawn < CONFIG.ENEMY_SPAWN_INTERVAL_MS) return;
  lastEnemySpawn = now;
  const x = Math.random() * (CONFIG.CANVAS_WIDTH - CONFIG.ENEMY_WIDTH);
  if (Math.random() < 0.5) {
    enemies.push(new DogEnemy(x, -CONFIG.ENEMY_HEIGHT));
  } else {
    enemies.push(new CatEnemy(x, -CONFIG.ENEMY_HEIGHT));
  }
}

function update(now) {
  frame++;
  background.update();

  if (state.current === 'title') {
    if (input.consumeAnyKey()) {
      init();
      state.startGame();
    }
    return;
  }

  if (state.current === 'win' || state.current === 'lose') {
    if (input.consumeAnyKey()) {
      init();
    }
    return;
  }

  // Playing or Boss phase
  const touch = input.consumeTouch();
  player.update(input, touch);

  // Auto-shoot
  if (player.canShoot(now)) {
    player.shoot(now);
    const blasts = createPawBlast(
      player.x + player.width / 2,
      player.y,
      player.level
    );
    playerBullets.push(...blasts);
  }

  // Update player bullets
  playerBullets.forEach(b => b.update());
  playerBullets = playerBullets.filter(b => !b.isOffscreen());

  // Spawn enemies (playing phase only)
  if (state.current === 'playing') {
    spawnEnemy(now);
  }

  // Update enemies
  enemies.forEach(e => {
    e.update(frame);
    const shots = e.tryShoot(
      player.x + player.width / 2,
      player.y + player.height / 2,
      now
    );
    enemyBullets.push(...shots);
  });
  enemies = enemies.filter(e => !e.isOffscreen());

  // Update enemy bullets
  enemyBullets.forEach(b => b.update());
  enemyBullets = enemyBullets.filter(b => !b.isOffscreen());

  // Update powerups
  powerups.forEach(p => p.update());
  powerups = powerups.filter(p => !p.isOffscreen());

  // Update boss
  if (boss && !boss.dead) {
    boss.update(frame, player.y);
    const shots = boss.tryShoot(now);
    enemyBullets.push(...shots);
  }

  // --- Collision Detection ---

  // Player bullets vs enemies
  for (let i = playerBullets.length - 1; i >= 0; i--) {
    const b = playerBullets[i];
    for (let j = enemies.length - 1; j >= 0; j--) {
      if (checkCollision(b.hitbox, enemies[j].hitbox)) {
        const enemy = enemies[j];
        const dead = enemy.takeDamage(1);
        playerBullets.splice(i, 1);
        if (dead) {
          const pts = enemy.type === 'dog' ? CONFIG.SCORE_PER_DOG : CONFIG.SCORE_PER_CAT;
          state.addScore(pts);
          state.addKill();
          if (shouldDropPowerUp()) {
            powerups.push(new PowerUp(enemy.x, enemy.y));
          }
          enemies.splice(j, 1);
        }
        break;
      }
    }
  }

  // Player bullets vs boss
  if (boss && !boss.dead && !boss.entering) {
    for (let i = playerBullets.length - 1; i >= 0; i--) {
      const b = playerBullets[i];
      if (checkCollision(b.hitbox, boss.hitbox)) {
        playerBullets.splice(i, 1);
        if (boss.takeDamage(1)) {
          state.addScore(CONFIG.SCORE_PER_BOSS);
          state.win();
        }
      }
    }
  }

  // Enemy bullets vs player
  if (!player.isInvincible(now)) {
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      if (checkCollision(enemyBullets[i].hitbox, player.hitbox)) {
        enemyBullets.splice(i, 1);
        player.hit(now);
        if (!player.alive) {
          state.lose();
          return;
        }
        break;
      }
    }
  }

  // Enemies vs player
  if (!player.isInvincible(now)) {
    for (let i = enemies.length - 1; i >= 0; i--) {
      if (checkCollision(enemies[i].hitbox, player.hitbox)) {
        enemies.splice(i, 1);
        player.hit(now);
        if (!player.alive) {
          state.lose();
          return;
        }
        break;
      }
    }
  }

  // Boss body vs player
  if (boss && !boss.dead && !player.isInvincible(now)) {
    if (checkCollision(boss.hitbox, player.hitbox)) {
      player.hit(now);
      if (!player.alive) {
        state.lose();
        return;
      }
    }
  }

  // Powerups vs player
  for (let i = powerups.length - 1; i >= 0; i--) {
    if (checkCollision(powerups[i].hitbox, player.hitbox)) {
      player.upgrade();
      powerups.splice(i, 1);
    }
  }

  // Check boss spawn
  if (state.current === 'playing' && state.killCount >= CONFIG.BOSS_SPAWN_KILL_COUNT) {
    boss = new Boss();
    enemies = [];
    state.startBoss();
  }
}

function draw() {
  background.draw(ctx);

  if (state.current === 'title') {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('黑臉貓大作戰', CONFIG.CANVAS_WIDTH / 2, 200);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('按任意鍵開始', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 100);
    ctx.fillStyle = '#999';
    ctx.fillText('[ ] 鍵切換背景色溫', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 75);
    drawCat(ctx, CONFIG.CANVAS_WIDTH / 2 - 50, 280);
    drawBoss(ctx, CONFIG.CANVAS_WIDTH / 2 - 32, 380);
    return;
  }

  if (state.current === 'win') {
    ctx.fillStyle = '#333';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!', CONFIG.CANVAS_WIDTH / 2, 200);
    drawBossFlipped(ctx, CONFIG.CANVAS_WIDTH / 2 - 32, 260);
    ctx.font = '18px monospace';
    ctx.fillText(`SCORE: ${state.score}`, CONFIG.CANVAS_WIDTH / 2, 380);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('按任意鍵回到標題', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 100);
    return;
  }

  if (state.current === 'lose') {
    ctx.fillStyle = '#a33';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CONFIG.CANVAS_WIDTH / 2, 250);
    ctx.fillStyle = '#333';
    ctx.font = '18px monospace';
    ctx.fillText(`SCORE: ${state.score}`, CONFIG.CANVAS_WIDTH / 2, 310);
    ctx.font = '14px monospace';
    ctx.fillStyle = '#666';
    ctx.fillText('按任意鍵回到標題', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 100);
    return;
  }

  // Draw game entities
  // Player (blink when invincible)
  const now = performance.now();
  if (!player.isInvincible(now) || Math.floor(now / 100) % 2 === 0) {
    drawCat(ctx, player.x, player.y);
  }

  // Player bullets
  playerBullets.forEach(b => drawPaw(ctx, b.x, b.y, player.level));

  // Enemies
  enemies.forEach(e => {
    if (e.type === 'dog') drawDogEnemy(ctx, e.x, e.y);
    else drawCatEnemy(ctx, e.x, e.y);
  });

  // Enemy bullets
  enemyBullets.forEach(b => {
    if (b.width >= 10) drawBone(ctx, b.x, b.y);
    else drawFurball(ctx, b.x, b.y, frame);
  });

  // Boss
  if (boss && !boss.dead) {
    drawBoss(ctx, boss.x, boss.y);
  }

  // Power-ups
  powerups.forEach(p => drawPowerUp(ctx, p.x, p.y, frame));

  // HUD
  const bossHp = boss && !boss.dead ? boss.hp : null;
  hud.draw(ctx, state.score, player.lives, player.level, bossHp);

  // Background temp notification
  const drawNow = performance.now();
  if (drawNow < tempNotifyUntil) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(CONFIG.CANVAS_WIDTH / 2 - 60, CONFIG.CANVAS_HEIGHT - 40, 120, 24);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`背景: ${background.tempLabel}`, CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT - 23);
    ctx.restore();
  }
}

function gameLoop(timestamp) {
  update(timestamp);
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
