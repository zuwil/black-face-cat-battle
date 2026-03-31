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
