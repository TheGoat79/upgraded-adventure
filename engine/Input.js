export class InputManager {
  constructor() {
    this.keys = new Map();
    this.keysPressed = new Map();
    this.keysReleased = new Map();
    this.mouse = { x: 0, y: 0, left: false, right: false, middle: false };
    this.mousePressed = { left: false, right: false, middle: false };
    this.mouseReleased = { left: false, right: false, middle: false };
    this.touch = { active: false, x: 0, y: 0, startX: 0, startY: 0 };
    this.touchStart = null;
    this.touchEnd = null;
    this.swipeThreshold = 50;
    this.init();
  }

  init() {
    window.addEventListener('keydown', (e) => this.onKeyDown(e));
    window.addEventListener('keyup', (e) => this.onKeyUp(e));
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mousedown', (e) => this.onMouseDown(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));
    window.addEventListener('touchstart', (e) => this.onTouchStart(e));
    window.addEventListener('touchmove', (e) => this.onTouchMove(e));
    window.addEventListener('touchend', (e) => this.onTouchEnd(e));
  }

  onKeyDown(e) {
    if (!this.keys.has(e.code)) {
      this.keysPressed.set(e.code, true);
    }
    this.keys.set(e.code, true);
  }

  onKeyUp(e) {
    this.keysReleased.set(e.code, true);
    this.keys.set(e.code, false);
  }

  onMouseMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }

  onMouseDown(e) {
    if (e.button === 0) {
      this.mouse.left = true;
      this.mousePressed.left = true;
    } else if (e.button === 1) {
      this.mouse.middle = true;
      this.mousePressed.middle = true;
    } else if (e.button === 2) {
      this.mouse.right = true;
      this.mousePressed.right = true;
    }
  }

  onMouseUp(e) {
    if (e.button === 0) {
      this.mouse.left = false;
      this.mouseReleased.left = true;
    } else if (e.button === 1) {
      this.mouse.middle = false;
      this.mouseReleased.middle = true;
    } else if (e.button === 2) {
      this.mouse.right = false;
      this.mouseReleased.right = true;
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touch.active = true;
    this.touch.x = touch.clientX;
    this.touch.y = touch.clientY;
    this.touch.startX = touch.clientX;
    this.touch.startY = touch.clientY;
    this.touchStart = { x: touch.clientX, y: touch.clientY };
  }

  onTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    this.touch.x = touch.clientX;
    this.touch.y = touch.clientY;
  }

  onTouchEnd(e) {
    e.preventDefault();
    this.touch.active = false;
    this.touchEnd = { x: this.touch.x, y: this.touch.y };
  }

  isKeyDown(code) {
    return this.keys.get(code) || false;
  }

  isKeyPressed(code) {
    return this.keysPressed.get(code) || false;
  }

  isKeyReleased(code) {
    return this.keysReleased.get(code) || false;
  }

  isMouseDown(button) {
    return this.mouse[button] || false;
  }

  isMousePressed(button) {
    return this.mousePressed[button] || false;
  }

  isMouseReleased(button) {
    return this.mouseReleased[button] || false;
  }

  getSwipe() {
    if (!this.touchStart || !this.touchEnd) return null;
    
    const dx = this.touchEnd.x - this.touchStart.x;
    const dy = this.touchEnd.y - this.touchStart.y;
    
    if (Math.abs(dx) < this.swipeThreshold && Math.abs(dy) < this.swipeThreshold) {
      return null;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    } else {
      return dy > 0 ? 'down' : 'up';
    }
  }

  update() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.mousePressed.left = false;
    this.mousePressed.right = false;
    this.mousePressed.middle = false;
    this.mouseReleased.left = false;
    this.mouseReleased.right = false;
    this.mouseReleased.middle = false;
    this.touchStart = null;
    this.touchEnd = null;
  }
}
