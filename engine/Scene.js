export class Scene {
  constructor(engine) {
    this.engine = engine;
    this.ui = [];
    this.paused = false;
  }

  onEnter() {
    // Called when scene is entered
  }

  onExit() {
    // Called when scene is exited
  }

  update(dt) {
    if (this.paused) return;
    const len = this.ui.length;
    for (let i = 0; i < len; i++) {
      this.ui[i].update(dt);
    }
  }

  render(ctx) {
    const len = this.ui.length;
    for (let i = 0; i < len; i++) {
      this.ui[i].render(ctx);
    }
  }

  handleClick(x, y) {
    for (let i = this.ui.length - 1; i >= 0; i--) {
      if (this.ui[i].handleClick(x, y)) {
        return true;
      }
    }
    return false;
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  addUI(element) {
    this.ui.push(element);
  }

  removeUI(element) {
    const index = this.ui.indexOf(element);
    if (index > -1) {
      this.ui.splice(index, 1);
    }
  }
}
