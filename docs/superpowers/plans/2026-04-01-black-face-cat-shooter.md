# 黑臉貓大作戰 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a vertical scrolling shooter web game where a black-face cat fires paw blasts at dog/cat enemies, culminating in a fat Pomeranian boss fight.

**Architecture:** Pure HTML5 Canvas 2D with no dependencies. Game logic is separated from rendering so logic can be unit-tested with Node.js native test runner. Each entity (player, enemy, boss, bullet, powerup) is a module exporting a class. A central game loop ties everything together.

**Tech Stack:** HTML5 Canvas, vanilla JavaScript (ES modules), Node.js native test runner (`node --test`)

---

## File Structure

```
index.html              — Entry page with canvas element
css/style.css           — Page styling, canvas centering
js/
  main.js               — Game init, game loop, wiring
  input.js              — Keyboard input tracking
  player.js             — Player class (position, lives, level, update)
  bullet.js             — Bullet class + PawBlast factory (3 levels)
  enemy.js              — Enemy base + DogEnemy / CatEnemy subclasses
  boss.js               — Boss class (2 phases)
  powerup.js            — PowerUp class (drop, collect)
  collision.js          — AABB collision detection
  sprites.js            — Pixel art draw functions (all characters)
  background.js         — Scrolling sky + clouds
  hud.js                — Score, lives, level display
  game-state.js         — State machine (title, playing, boss, win, lose)
  config.js             — All magic numbers (canvas size, speeds, HP, etc.)
tests/
  collision.test.js     — Collision detection tests
  player.test.js        — Player logic tests
  bullet.test.js        — Bullet/paw blast tests
  enemy.test.js         — Enemy movement tests
  boss.test.js          — Boss phase tests
  powerup.test.js       — Power-up logic tests
  game-state.test.js    — State transition tests
```

---

### Task 1: Project Scaffold + Config

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/config.js`

- [ ] **Step 1: Create `js/config.js`**

```js
export const CONFIG = {
  CANVAS_WIDTH: 480,
  CANVAS_HEIGHT: 640,
  FPS: 60,

  PLAYER_SPEED: 4,
  PLAYER_LIVES: 3,
  PLAYER_INVINCIBLE_MS: 2000,
  PLAYER_WIDTH: 32,
  PLAYER_HEIGHT: 32,
  PLAYER_HITBOX_SHRINK: 4,

  BULLET_SPEED: 6,
  SHOOT_INTERVAL_MS: 200,

  ENEMY_DOG_SPEED: 2,
  ENEMY_CAT_SPEED: 1.5,
  ENEMY_CAT_BULLET_SPEED: 3,
  ENEMY_SPAWN_INTERVAL_MS: 1000,
  ENEMY_WIDTH: 28,
  ENEMY_HEIGHT: 28,

  BOSS_HP: 60,
  BOSS_SPEED_PHASE1: 1.5,
  BOSS_SPEED_PHASE2: 3,
  BOSS_WIDTH: 64,
  BOSS_HEIGHT: 64,
  BOSS_BULLET_SPEED: 3,
  BOSS_CHARGE_SPEED: 5,
  BOSS_SPAWN_KILL_COUNT: 30,

  POWERUP_DROP_CHANCE: 0.15,
  POWERUP_SPEED: 2,
  POWERUP_WIDTH: 20,
  POWERUP_HEIGHT: 20,

  SCORE_PER_DOG: 100,
  SCORE_PER_CAT: 150,
  SCORE_PER_BOSS: 5000,
};
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>黑臉貓大作戰</title>
  <link rel="stylesheet" href="css/style.css">
</head>
<body>
  <canvas id="game" width="480" height="640"></canvas>
  <script type="module" src="js/main.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create `css/style.css`**

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #111;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

canvas {
  border: 2px solid #444;
  image-rendering: pixelated;
}
```

- [ ] **Step 4: Create placeholder `js/main.js`**

```js
import { CONFIG } from './config.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#222';
ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
ctx.fillStyle = '#fff';
ctx.font = '20px monospace';
ctx.textAlign = 'center';
ctx.fillText('黑臉貓大作戰', CONFIG.CANVAS_WIDTH / 2, CONFIG.CANVAS_HEIGHT / 2);
```

- [ ] **Step 5: Verify in browser**

Open `index.html` in a browser (or run `npx serve .`). You should see a dark canvas with "黑臉貓大作戰" centered.

- [ ] **Step 6: Commit**

```bash
git add index.html css/style.css js/config.js js/main.js
git commit -m "feat: project scaffold with canvas and config"
```

---

### Task 2: Collision Detection (TDD)

**Files:**
- Create: `js/collision.js`
- Create: `tests/collision.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/collision.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/collision.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```js
// js/collision.js
export function checkCollision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/collision.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/collision.js tests/collision.test.js
git commit -m "feat: AABB collision detection with tests"
```

---

### Task 3: Input Handler

**Files:**
- Create: `js/input.js`

- [ ] **Step 1: Create `js/input.js`**

```js
// js/input.js
export class Input {
  constructor() {
    this.keys = {};
    this._onKeyDown = (e) => {
      this.keys[e.key] = true;
      e.preventDefault();
    };
    this._onKeyUp = (e) => {
      this.keys[e.key] = false;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  isDown(key) {
    return !!this.keys[key];
  }

  get left() {
    return this.isDown('ArrowLeft') || this.isDown('a');
  }

  get right() {
    return this.isDown('ArrowRight') || this.isDown('d');
  }

  get up() {
    return this.isDown('ArrowUp') || this.isDown('w');
  }

  get down() {
    return this.isDown('ArrowDown') || this.isDown('s');
  }

  get shoot() {
    return this.isDown(' ');
  }

  get anyKey() {
    return Object.values(this.keys).some(Boolean);
  }

  consumeAnyKey() {
    const was = this.anyKey;
    if (was) this.keys = {};
    return was;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/input.js
git commit -m "feat: keyboard input handler"
```

---

### Task 4: Player Logic (TDD)

**Files:**
- Create: `js/player.js`
- Create: `tests/player.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/player.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/player.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write implementation**

```js
// js/player.js
import { CONFIG } from './config.js';

export class Player {
  constructor() {
    this.width = CONFIG.PLAYER_WIDTH;
    this.height = CONFIG.PLAYER_HEIGHT;
    this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
    this.y = CONFIG.CANVAS_HEIGHT - this.height - 20;
    this.lives = CONFIG.PLAYER_LIVES;
    this.level = 1;
    this.invincibleUntil = 0;
    this.lastShotTime = 0;
  }

  update(input) {
    if (input.left) this.x -= CONFIG.PLAYER_SPEED;
    if (input.right) this.x += CONFIG.PLAYER_SPEED;
    if (input.up) this.y -= CONFIG.PLAYER_SPEED;
    if (input.down) this.y += CONFIG.PLAYER_SPEED;

    this.x = Math.max(0, Math.min(CONFIG.CANVAS_WIDTH - this.width, this.x));
    this.y = Math.max(0, Math.min(CONFIG.CANVAS_HEIGHT - this.height, this.y));
  }

  get hitbox() {
    const s = CONFIG.PLAYER_HITBOX_SHRINK;
    return {
      x: this.x + s,
      y: this.y + s,
      width: this.width - s * 2,
      height: this.height - s * 2,
    };
  }

  canShoot(now) {
    return now - this.lastShotTime >= CONFIG.SHOOT_INTERVAL_MS;
  }

  shoot(now) {
    this.lastShotTime = now;
  }

  upgrade() {
    if (this.level < 3) this.level++;
  }

  hit(now) {
    this.lives--;
    if (this.level > 1) this.level--;
    this.invincibleUntil = now + CONFIG.PLAYER_INVINCIBLE_MS;
  }

  isInvincible(now) {
    return now < this.invincibleUntil;
  }

  get alive() {
    return this.lives > 0;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/player.test.js`
Expected: All 8 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/player.js tests/player.test.js
git commit -m "feat: player class with movement, upgrade, and hit logic"
```

---

### Task 5: Bullet / Paw Blast System (TDD)

**Files:**
- Create: `js/bullet.js`
- Create: `tests/bullet.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/bullet.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/bullet.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// js/bullet.js
import { CONFIG } from './config.js';

export class Bullet {
  constructor(x, y, dx, dy, width, height) {
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.width = width;
    this.height = height;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  isOffscreen() {
    return (
      this.y + this.height < 0 ||
      this.y > CONFIG.CANVAS_HEIGHT ||
      this.x + this.width < 0 ||
      this.x > CONFIG.CANVAS_WIDTH
    );
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

export function createPawBlast(centerX, topY, level) {
  const speed = CONFIG.BULLET_SPEED;
  if (level === 1) {
    return [new Bullet(centerX - 4, topY, 0, -speed, 8, 8)];
  }
  if (level === 2) {
    return [
      new Bullet(centerX - 10, topY, -1, -speed, 8, 8),
      new Bullet(centerX + 2, topY, 1, -speed, 8, 8),
    ];
  }
  // level 3
  return [
    new Bullet(centerX - 6, topY, 0, -speed, 12, 12),
    new Bullet(centerX - 18, topY, -2, -speed, 12, 12),
    new Bullet(centerX + 6, topY, 2, -speed, 12, 12),
  ];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/bullet.test.js`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/bullet.js tests/bullet.test.js
git commit -m "feat: bullet and paw blast system with 3 levels"
```

---

### Task 6: Enemy Classes (TDD)

**Files:**
- Create: `js/enemy.js`
- Create: `tests/enemy.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/enemy.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/enemy.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// js/enemy.js
import { CONFIG } from './config.js';
import { Bullet } from './bullet.js';

class Enemy {
  constructor(x, y, hp) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.ENEMY_WIDTH;
    this.height = CONFIG.ENEMY_HEIGHT;
    this.hp = hp;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  isOffscreen() {
    return this.y > CONFIG.CANVAS_HEIGHT + 20;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }
}

export class DogEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 1);
    this.type = 'dog';
    this.wobbleOffset = Math.random() * Math.PI * 2;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_DOG_SPEED;
    this.x += Math.sin((frame + this.wobbleOffset) * 0.05) * 0.8;
  }

  tryShoot() {
    return [];
  }
}

export class CatEnemy extends Enemy {
  constructor(x, y) {
    super(x, y, 1);
    this.type = 'cat';
    this.zigzagOffset = Math.random() * Math.PI * 2;
    this.lastShotTime = 0;
    this.shotInterval = 1500 + Math.random() * 1000;
  }

  update(frame) {
    this.y += CONFIG.ENEMY_CAT_SPEED;
    this.x += Math.sin((frame + this.zigzagOffset) * 0.08) * 2;
  }

  tryShoot(playerX, playerY, now) {
    if (now - this.lastShotTime < this.shotInterval) return [];
    this.lastShotTime = now;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return [];

    const speed = CONFIG.ENEMY_CAT_BULLET_SPEED;
    return [
      new Bullet(
        this.x + this.width / 2 - 4,
        this.y + this.height,
        (dx / dist) * speed,
        (dy / dist) * speed,
        8,
        8
      ),
    ];
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/enemy.test.js`
Expected: All 5 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/enemy.js tests/enemy.test.js
git commit -m "feat: dog and cat enemy classes with movement patterns"
```

---

### Task 7: Boss Class (TDD)

**Files:**
- Create: `js/boss.js`
- Create: `tests/boss.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/boss.test.js
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
    const startX = b.x;
    b.update(0, 300);
    assert.ok(b.x !== startX);
  });

  it('switches to phase 2 at half HP', () => {
    const b = new Boss();
    b.hp = CONFIG.BOSS_HP / 2;
    b.update(0, 300);
    assert.equal(b.phase, 2);
  });

  it('fires bone bullets', () => {
    const b = new Boss();
    b.lastShotTime = 0;
    const bullets = b.tryShoot(2000);
    assert.ok(bullets.length > 0);
  });

  it('charges down in phase 2', () => {
    const b = new Boss();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/boss.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// js/boss.js
import { CONFIG } from './config.js';
import { Bullet } from './bullet.js';

export class Boss {
  constructor() {
    this.width = CONFIG.BOSS_WIDTH;
    this.height = CONFIG.BOSS_HEIGHT;
    this.x = CONFIG.CANVAS_WIDTH / 2 - this.width / 2;
    this.y = -this.height;
    this.targetY = 40;
    this.hp = CONFIG.BOSS_HP;
    this.phase = 1;
    this.direction = 1;
    this.entering = true;
    this.lastShotTime = 0;
    this.shotInterval = 800;
    this.chargeTimer = 0;
    this.charging = false;
    this.chargeTargetY = 0;
    this.canCharge = false;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }

  get dead() {
    return this.hp <= 0;
  }

  takeDamage(amount) {
    this.hp -= amount;
    return this.hp <= 0;
  }

  update(frame, playerY) {
    if (this.hp <= CONFIG.BOSS_HP / 2) {
      this.phase = 2;
      this.canCharge = true;
    }

    if (this.entering) {
      this.y += 1;
      if (this.y >= this.targetY) {
        this.y = this.targetY;
        this.entering = false;
      }
      return;
    }

    const speed = this.phase === 1 ? CONFIG.BOSS_SPEED_PHASE1 : CONFIG.BOSS_SPEED_PHASE2;

    if (this.charging) {
      this.y += CONFIG.BOSS_CHARGE_SPEED;
      if (this.y >= this.chargeTargetY) {
        this.charging = false;
        this.y = this.targetY;
        this.chargeTimer = frame;
      }
      return;
    }

    this.x += speed * this.direction;
    if (this.x <= 0) this.direction = 1;
    if (this.x + this.width >= CONFIG.CANVAS_WIDTH) this.direction = -1;

    if (this.phase === 2 && !this.charging && frame - this.chargeTimer > 180) {
      this.charging = true;
      this.chargeTargetY = playerY;
    }
  }

  tryShoot(now) {
    if (this.entering) return [];
    if (now - this.lastShotTime < this.shotInterval) return [];
    this.lastShotTime = now;

    const cx = this.x + this.width / 2;
    const by = this.y + this.height;
    const speed = CONFIG.BOSS_BULLET_SPEED;
    const bullets = [
      new Bullet(cx - 4, by, 0, speed, 10, 10),
      new Bullet(cx - 4, by, -1.5, speed, 10, 10),
      new Bullet(cx - 4, by, 1.5, speed, 10, 10),
    ];

    if (this.phase === 2) {
      bullets.push(new Bullet(cx - 4, by, -3, speed * 0.8, 10, 10));
      bullets.push(new Bullet(cx - 4, by, 3, speed * 0.8, 10, 10));
    }

    return bullets;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/boss.test.js`
Expected: All 6 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/boss.js tests/boss.test.js
git commit -m "feat: boss class with 2-phase behavior"
```

---

### Task 8: Power-Up (TDD)

**Files:**
- Create: `js/powerup.js`
- Create: `tests/powerup.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/powerup.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/powerup.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// js/powerup.js
import { CONFIG } from './config.js';

export class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = CONFIG.POWERUP_WIDTH;
    this.height = CONFIG.POWERUP_HEIGHT;
  }

  update() {
    this.y += CONFIG.POWERUP_SPEED;
  }

  isOffscreen() {
    return this.y > CONFIG.CANVAS_HEIGHT + 10;
  }

  get hitbox() {
    return { x: this.x, y: this.y, width: this.width, height: this.height };
  }
}

export function shouldDropPowerUp() {
  return Math.random() < CONFIG.POWERUP_DROP_CHANCE;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/powerup.test.js`
Expected: All 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/powerup.js tests/powerup.test.js
git commit -m "feat: power-up drop and collection"
```

---

### Task 9: Game State Machine (TDD)

**Files:**
- Create: `js/game-state.js`
- Create: `tests/game-state.test.js`

- [ ] **Step 1: Write the failing test**

```js
// tests/game-state.test.js
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/game-state.test.js`
Expected: FAIL

- [ ] **Step 3: Write implementation**

```js
// js/game-state.js
export class GameState {
  constructor() {
    this.current = 'title';
    this.score = 0;
    this.killCount = 0;
  }

  startGame() {
    this.current = 'playing';
    this.score = 0;
    this.killCount = 0;
  }

  startBoss() {
    this.current = 'boss';
  }

  win() {
    this.current = 'win';
  }

  lose() {
    this.current = 'lose';
  }

  restart() {
    this.current = 'title';
    this.score = 0;
    this.killCount = 0;
  }

  addScore(points) {
    this.score += points;
  }

  addKill() {
    this.killCount++;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/game-state.test.js`
Expected: All 7 tests PASS

- [ ] **Step 5: Commit**

```bash
git add js/game-state.js tests/game-state.test.js
git commit -m "feat: game state machine with score tracking"
```

---

### Task 10: Pixel Art Sprites

**Files:**
- Create: `js/sprites.js`

This task has no automated tests — sprites are verified visually in the browser.

- [ ] **Step 1: Create `js/sprites.js`**

```js
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

// Furball (cat enemy bullet) - 8x8
const FURBALL_PIXELS = [
  [_, _, GR, GR, GR, _, _, _],
  [_, GR, GR, GR, GR, GR, _, _],
  [GR, GR, GR, GR, GR, GR, GR, _],
  [GR, GR, GR, GR, GR, GR, GR, _],
  [GR, GR, GR, GR, GR, GR, GR, _],
  [_, GR, GR, GR, GR, GR, _, _],
  [_, _, GR, GR, GR, _, _, _],
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
  drawPixelArt(ctx, x, y, BONE_PIXELS, 1);
}

export function drawFurball(ctx, x, y) {
  drawPixelArt(ctx, x, y, FURBALL_PIXELS, 1);
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
```

- [ ] **Step 2: Verify visually**

Open the browser dev console on `index.html` and temporarily import/call draw functions to check sprites render correctly. Or wait until Task 12 integration.

- [ ] **Step 3: Commit**

```bash
git add js/sprites.js
git commit -m "feat: pixel art sprites for all characters"
```

---

### Task 11: Scrolling Background

**Files:**
- Create: `js/background.js`

- [ ] **Step 1: Create `js/background.js`**

```js
// js/background.js
import { CONFIG } from './config.js';

export class Background {
  constructor() {
    this.scrollY = 0;
    this.scrollSpeed = 0.5;
    this.clouds = [];
    for (let i = 0; i < 6; i++) {
      this.clouds.push({
        x: Math.random() * CONFIG.CANVAS_WIDTH,
        y: Math.random() * CONFIG.CANVAS_HEIGHT,
        width: 40 + Math.random() * 60,
        height: 15 + Math.random() * 15,
        speed: 0.2 + Math.random() * 0.3,
      });
    }
  }

  update() {
    this.scrollY += this.scrollSpeed;
    for (const cloud of this.clouds) {
      cloud.y += cloud.speed;
      if (cloud.y > CONFIG.CANVAS_HEIGHT + 20) {
        cloud.y = -cloud.height;
        cloud.x = Math.random() * CONFIG.CANVAS_WIDTH;
      }
    }
  }

  draw(ctx) {
    // Sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, CONFIG.CANVAS_HEIGHT);
    grad.addColorStop(0, '#87CEEB');
    grad.addColorStop(1, '#E0F0FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);

    // Clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    for (const cloud of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(
        cloud.x + cloud.width / 2,
        cloud.y + cloud.height / 2,
        cloud.width / 2,
        cloud.height / 2,
        0, 0, Math.PI * 2
      );
      ctx.fill();
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add js/background.js
git commit -m "feat: scrolling sky background with clouds"
```

---

### Task 12: HUD

**Files:**
- Create: `js/hud.js`

- [ ] **Step 1: Create `js/hud.js`**

```js
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
```

- [ ] **Step 2: Commit**

```bash
git add js/hud.js
git commit -m "feat: HUD with score, lives, level, and boss HP bar"
```

---

### Task 13: Main Game Loop — Full Integration

**Files:**
- Modify: `js/main.js` (full rewrite)

- [ ] **Step 1: Rewrite `js/main.js`**

```js
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
const input = new Input();
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
  player.update(input);

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
    if (e.type === 'cat') {
      const shots = e.tryShoot(
        player.x + player.width / 2,
        player.y + player.height / 2,
        now
      );
      enemyBullets.push(...shots);
    }
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
    else drawFurball(ctx, b.x, b.y);
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
}

function gameLoop(timestamp) {
  update(timestamp);
  draw();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
```

- [ ] **Step 2: Open in browser and verify**

Open `index.html`. Expected:
- Title screen with "黑臉貓大作戰" text, cat and boss sprites
- Press any key → game starts, cat appears at bottom, auto-shoots paw blasts upward
- Enemies spawn from top (dogs and cats)
- Cat enemies shoot furball toward player
- Kill enemies → score increases, power-ups drop occasionally
- Pick up power-up → paw level increases
- Kill 30 enemies → boss appears
- Defeat boss → win screen with flipped boss
- Lose all lives → game over screen
- Any key returns to title

- [ ] **Step 3: Commit**

```bash
git add js/main.js
git commit -m "feat: full game loop integration with all systems"
```

---

### Task 14: Run All Tests

- [ ] **Step 1: Run full test suite**

Run: `node --test tests/*.test.js`
Expected: All tests PASS (collision: 4, player: 8, bullet: 5, enemy: 5, boss: 6, powerup: 4, game-state: 7 = 39 total)

- [ ] **Step 2: Fix any failures**

If any test fails, investigate and fix.

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "chore: verify all tests pass"
```

---

### Task 15: Playtesting & Polish

Manual verification — no automated tests.

- [ ] **Step 1: Playtest title → game → boss → win flow**

Play through the full game. Check:
- Controls feel responsive
- Enemy spawn rate is reasonable
- Boss difficulty is fair
- Power-up drop rate feels right

- [ ] **Step 2: Playtest lose flow**

Get hit 3 times to verify:
- Lives decrease correctly
- Invincibility flashing works
- Paw level downgrades on hit
- Game Over screen shows

- [ ] **Step 3: Adjust CONFIG values if needed**

Tweak `js/config.js` values based on playtesting. Common adjustments:
- `ENEMY_SPAWN_INTERVAL_MS` — faster/slower enemy flow
- `BOSS_HP` — easier/harder boss
- `POWERUP_DROP_CHANCE` — more/fewer upgrades
- `PLAYER_SPEED` — movement responsiveness

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "polish: playtest adjustments"
```
