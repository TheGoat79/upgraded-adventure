export class UIElement {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.visible = true;
    this.enabled = true;
    this.children = [];
    this.parent = null;
  }

  addChild(child) {
    this.children.push(child);
    child.parent = this;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  update(dt) {
    this.children.forEach(child => child.update(dt));
  }

  render(ctx) {
    if (!this.visible) return;
    this.children.forEach(child => child.render(ctx));
  }

  handleClick(x, y) {
    if (!this.enabled || !this.visible) return false;
    
    for (let i = this.children.length - 1; i >= 0; i--) {
      if (this.children[i].handleClick(x, y)) {
        return true;
      }
    }
    
    return false;
  }
}

export class Button extends UIElement {
  constructor(x, y, width, height, text, onClick) {
    super(x, y, width, height);
    this.text = text;
    this.onClick = onClick;
    this.hovered = false;
    this.pressed = false;
    this.backgroundColor = '#4a90d9';
    this.hoverColor = '#5ba0e9';
    this.pressedColor = '#3a80c9';
    this.textColor = '#ffffff';
    this.fontSize = 16;
  }

  update(dt) {
    super.update(dt);
  }

  render(ctx) {
    if (!this.visible) return;
    
    let color = this.backgroundColor;
    if (this.pressed) {
      color = this.pressedColor;
    } else if (this.hovered) {
      color = this.hoverColor;
    }
    
    ctx.fillStyle = color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = this.textColor;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    
    super.render(ctx);
  }

  handleClick(x, y) {
    if (!this.enabled || !this.visible) return false;
    
    if (x >= this.x && x <= this.x + this.width &&
        y >= this.y && y <= this.y + this.height) {
      if (this.onClick) {
        this.onClick();
      }
      return true;
    }
    
    return super.handleClick(x, y);
  }

  setHovered(hovered) {
    this.hovered = hovered;
  }

  setPressed(pressed) {
    this.pressed = pressed;
  }
}

export class Label extends UIElement {
  constructor(x, y, text, fontSize = 16, color = '#ffffff') {
    super(x, y, 0, 0);
    this.text = text;
    this.fontSize = fontSize;
    this.color = color;
    this.textAlign = 'left';
    this.textBaseline = 'top';
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.color;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.textAlign = this.textAlign;
    ctx.textBaseline = this.textBaseline;
    ctx.fillText(this.text, this.x, this.y);
    
    super.render(ctx);
  }
}

export class Panel extends UIElement {
  constructor(x, y, width, height, backgroundColor = '#2c3e50') {
    super(x, y, width, height);
    this.backgroundColor = backgroundColor;
    this.borderColor = '#34495e';
    this.borderWidth = 2;
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
    
    super.render(ctx);
  }
}

export class ProgressBar extends UIElement {
  constructor(x, y, width, height, value = 0, maxValue = 100) {
    super(x, y, width, height);
    this.value = value;
    this.maxValue = maxValue;
    this.backgroundColor = '#2c3e50';
    this.fillColor = '#27ae60';
    this.borderColor = '#34495e';
  }

  setValue(value) {
    this.value = Math.max(0, Math.min(this.maxValue, value));
  }

  render(ctx) {
    if (!this.visible) return;
    
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    const progress = this.value / this.maxValue;
    ctx.fillStyle = this.fillColor;
    ctx.fillRect(this.x, this.y, this.width * progress, this.height);
    
    ctx.strokeStyle = this.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
    
    super.render(ctx);
  }
}
