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
    this.alpha = 1;
    this.scale = 1;
    this.rotation = 0;
    this.pivotX = 0;
    this.pivotY = 0;
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
    
    ctx.save();
    ctx.globalAlpha = this.alpha;
    
    // Apply transformations
    if (this.scale !== 1 || this.rotation !== 0) {
      const pivotX = this.x + this.width * this.pivotX;
      const pivotY = this.y + this.height * this.pivotY;
      ctx.translate(pivotX, pivotY);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      ctx.translate(-pivotX, -pivotY);
    }
    
    this.children.forEach(child => child.render(ctx));
    ctx.restore();
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

  containsPoint(x, y) {
    return x >= this.x && x <= this.x + this.width &&
           y >= this.y && y <= this.y + this.height;
  }

  setAlpha(alpha) {
    this.alpha = Math.max(0, Math.min(1, alpha));
  }

  setScale(scale) {
    this.scale = scale;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  setPivot(x, y) {
    this.pivotX = x;
    this.pivotY = y;
  }
}

export class Button extends UIElement {
  constructor(x, y, width, height, text, onClick) {
    super(x, y, width, height);
    this.text = text;
    this.onClick = onClick;
    this.hovered = false;
    this.pressed = false;
    this.focused = false;
    this.backgroundColor = '#4a90d9';
    this.hoverColor = '#5ba0e9';
    this.pressedColor = '#3a80c9';
    this.focusedColor = '#6ab0f9';
    this.disabledColor = '#2a5069';
    this.textColor = '#ffffff';
    this.disabledTextColor = '#888888';
    this.fontSize = 16;
    this.cornerRadius = 8;
    this.borderWidth = 0;
    this.borderColor = '#000000';
    this.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.shadowBlur = 0;
    this.shadowOffsetX = 0;
    this.shadowOffsetY = 0;
    this.animation = {
      scale: 1,
      targetScale: 1,
      alpha: 1,
      targetAlpha: 1
    };
    this.clickAnimation = false;
    this.clickTimer = 0;
  }

  update(dt) {
    super.update(dt);
    
    // Handle click animation
    if (this.clickAnimation) {
      this.clickTimer -= dt;
      if (this.clickTimer <= 0) {
        this.clickAnimation = false;
        this.animation.targetScale = 1;
      }
    }
    
    // Animate scale
    const scaleSpeed = 10;
    this.animation.scale += (this.animation.targetScale - this.animation.scale) * scaleSpeed * dt;
    
    // Animate alpha
    const alphaSpeed = 10;
    this.animation.alpha += (this.animation.targetAlpha - this.animation.alpha) * alphaSpeed * dt;
    
    // Set visual properties
    this.scale = this.animation.scale;
    this.alpha = this.animation.alpha;
  }

  render(ctx) {
    if (!this.visible) return;
    
    let color = this.backgroundColor;
    let textColor = this.textColor;
    
    if (!this.enabled) {
      color = this.disabledColor;
      textColor = this.disabledTextColor;
    } else if (this.pressed) {
      color = this.pressedColor;
    } else if (this.focused) {
      color = this.focusedColor;
    } else if (this.hovered) {
      color = this.hoverColor;
    }
    
    ctx.save();
    
    // Apply shadow
    if (this.shadowBlur > 0) {
      ctx.shadowColor = this.shadowColor;
      ctx.shadowBlur = this.shadowBlur;
      ctx.shadowOffsetX = this.shadowOffsetX;
      ctx.shadowOffsetY = this.shadowOffsetY;
    }
    
    // Draw button background with rounded corners
    this.drawRoundedRect(ctx, this.x, this.y, this.width, this.height, this.cornerRadius, color);
    
    // Draw border
    if (this.borderWidth > 0) {
      ctx.strokeStyle = this.borderColor;
      ctx.lineWidth = this.borderWidth;
      this.drawRoundedRectStroke(ctx, this.x, this.y, this.width, this.height, this.cornerRadius);
    }
    
    // Draw focus indicator
    if (this.focused && this.enabled) {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
    }
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    
    // Draw text
    ctx.fillStyle = textColor;
    ctx.font = `${this.fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.text, this.x + this.width / 2, this.y + this.height / 2);
    
    ctx.restore();
    
    super.render(ctx);
  }

  drawRoundedRect(ctx, x, y, width, height, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  drawRoundedRectStroke(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.stroke();
  }

  handleClick(x, y) {
    if (!this.enabled || !this.visible) return false;
    
    if (this.containsPoint(x, y)) {
      this.triggerClick();
      return true;
    }
    
    return super.handleClick(x, y);
  }

  triggerClick() {
    this.clickAnimation = true;
    this.clickTimer = 0.1;
    this.animation.targetScale = 0.95;
    
    if (this.onClick) {
      this.onClick();
    }
  }

  setHovered(hovered) {
    this.hovered = hovered;
    if (hovered && this.enabled) {
      this.animation.targetScale = 1.05;
    } else if (!this.clickAnimation) {
      this.animation.targetScale = 1;
    }
  }

  setPressed(pressed) {
    this.pressed = pressed;
  }

  setFocused(focused) {
    this.focused = focused;
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (!enabled) {
      this.animation.targetAlpha = 0.5;
    } else {
      this.animation.targetAlpha = 1;
    }
  }

  setColors(colors) {
    if (colors.background) this.backgroundColor = colors.background;
    if (colors.hover) this.hoverColor = colors.hover;
    if (colors.pressed) this.pressedColor = colors.pressed;
    if (colors.focused) this.focusedColor = colors.focused;
    if (colors.disabled) this.disabledColor = colors.disabled;
    if (colors.text) this.textColor = colors.text;
    if (colors.disabledText) this.disabledTextColor = colors.disabledText;
  }

  setShadow(blur, color, offsetX = 0, offsetY = 0) {
    this.shadowBlur = blur;
    this.shadowColor = color;
    this.shadowOffsetX = offsetX;
    this.shadowOffsetY = offsetY;
  }

  setBorder(width, color) {
    this.borderWidth = width;
    this.borderColor = color;
  }

  setCornerRadius(radius) {
    this.cornerRadius = radius;
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
