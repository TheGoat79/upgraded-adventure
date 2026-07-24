/**
 * UI.js - UI System
 * Reusable UI components for canvas-based interface
 */

import { rectRectCollision, pointRectCollision } from './Collision.js';
import { lerp, clamp, colorToCss, colorToCssRgba } from './Utils.js';

// ==================== Base UI Element ====================

export class UIElement {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.enabled = true;
        this.anchor = 'top-left'; // top-left, top-center, top-right, center-left, center, center-right, bottom-left, bottom-center, bottom-right
        this.parent = null;
        this.children = [];
        this.zIndex = 0;
    }
    
    /**
     * Get absolute position based on anchor
     */
    getAbsolutePosition(canvasWidth, canvasHeight) {
        let x = this.x;
        let y = this.y;
        
        switch (this.anchor) {
            case 'top-center':
                x = canvasWidth / 2 + this.x;
                break;
            case 'top-right':
                x = canvasWidth - this.x;
                break;
            case 'center-left':
                y = canvasHeight / 2 + this.y;
                break;
            case 'center':
                x = canvasWidth / 2 + this.x;
                y = canvasHeight / 2 + this.y;
                break;
            case 'center-right':
                x = canvasWidth - this.x;
                y = canvasHeight / 2 + this.y;
                break;
            case 'bottom-left':
                y = canvasHeight - this.y;
                break;
            case 'bottom-center':
                x = canvasWidth / 2 + this.x;
                y = canvasHeight - this.y;
                break;
            case 'bottom-right':
                x = canvasWidth - this.x;
                y = canvasHeight - this.y;
                break;
        }
        
        return { x, y };
    }
    
    /**
     * Get bounding box
     */
    getBounds(canvasWidth, canvasHeight) {
        const pos = this.getAbsolutePosition(canvasWidth, canvasHeight);
        return {
            x: pos.x,
            y: pos.y,
            width: this.width,
            height: this.height
        };
    }
    
    /**
     * Check if point is inside element
     */
    containsPoint(point, canvasWidth, canvasHeight) {
        const bounds = this.getBounds(canvasWidth, canvasHeight);
        return pointRectCollision(point, bounds);
    }
    
    /**
     * Update element
     */
    update(dt, input, canvasWidth, canvasHeight) {
        if (!this.visible || !this.enabled) return;
        
        // Update children
        for (const child of this.children) {
            child.update(dt, input, canvasWidth, canvasHeight);
        }
    }
    
    /**
     * Render element
     */
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        // Render children
        for (const child of this.children) {
            child.render(ctx, canvasWidth, canvasHeight);
        }
    }
    
    /**
     * Add child element
     */
    addChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
    }
    
    /**
     * Remove child element
     */
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
    }
    
    /**
     * Set visibility
     */
    setVisible(visible) {
        this.visible = visible;
    }
    
    /**
     * Set enabled state
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }
}

// ==================== Button ====================

export class Button extends UIElement {
    constructor(x, y, width, height, text = '') {
        super(x, y, width, height);
        this.text = text;
        this.backgroundColor = '#4CAF50';
        this.hoverColor = '#45a049';
        this.clickColor = '#3d8b40';
        this.textColor = '#ffffff';
        this.fontSize = 18;
        this.fontFamily = 'Arial';
        this.borderRadius = 5;
        this.borderWidth = 0;
        this.borderColor = '#000000';
        this.isHovered = false;
        this.isClicked = false;
        this.onClick = null;
        this.onHover = null;
        this.onHoverExit = null;
        this.animationProgress = 0;
    }
    
    update(dt, input, canvasWidth, canvasHeight) {
        super.update(dt, input, canvasWidth, canvasHeight);
        
        if (!this.enabled) {
            this.isHovered = false;
            return;
        }
        
        const mousePos = input.getMousePosition();
        const wasHovered = this.isHovered;
        this.isHovered = this.containsPoint(mousePos, canvasWidth, canvasHeight);
        
        // Handle hover events
        if (this.isHovered && !wasHovered && this.onHover) {
            this.onHover();
        }
        
        if (!this.isHovered && wasHovered && this.onHoverExit) {
            this.onHoverExit();
        }
        
        // Handle click
        if (this.isHovered && input.isMouseButtonPressed(0)) {
            this.isClicked = true;
        }
        
        if (input.isMouseButtonReleased(0) && this.isClicked) {
            if (this.isHovered && this.onClick) {
                this.onClick();
            }
            this.isClicked = false;
        }
        
        // Animation
        const targetProgress = this.isClicked ? 1 : (this.isHovered ? 0.5 : 0);
        this.animationProgress = lerp(this.animationProgress, targetProgress, 0.2);
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        const bounds = this.getBounds(canvasWidth, canvasHeight);
        
        // Calculate color based on state
        let bgColor = this.backgroundColor;
        if (this.isClicked) {
            bgColor = this.clickColor;
        } else if (this.isHovered) {
            bgColor = this.hoverColor;
        }
        
        // Draw button background
        ctx.fillStyle = bgColor;
        
        if (this.borderRadius > 0) {
            this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        
        // Draw border
        if (this.borderWidth > 0) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            
            if (this.borderRadius > 0) {
                this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }
        
        // Draw text
        if (this.text) {
            ctx.fillStyle = this.textColor;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.text, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        }
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
    
    _drawRoundedRect(ctx, x, y, width, height, radius) {
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
    }
}

// ==================== Label ====================

export class Label extends UIElement {
    constructor(x, y, text = '') {
        super(x, y, 0, 0);
        this.text = text;
        this.textColor = '#ffffff';
        this.fontSize = 16;
        this.fontFamily = 'Arial';
        this.textAlign = 'left';
        this.textBaseline = 'top';
        this.bold = false;
        this.italic = false;
        this.shadowColor = null;
        this.shadowBlur = 0;
        this.shadowOffsetX = 0;
        this.shadowOffsetY = 0;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible || !this.text) return;
        
        const pos = this.getAbsolutePosition(canvasWidth, canvasHeight);
        
        // Set font
        let fontStyle = '';
        if (this.italic) fontStyle += 'italic ';
        if (this.bold) fontStyle += 'bold ';
        ctx.font = `${fontStyle}${this.fontSize}px ${this.fontFamily}`;
        
        // Set shadow
        if (this.shadowColor) {
            ctx.shadowColor = this.shadowColor;
            ctx.shadowBlur = this.shadowBlur;
            ctx.shadowOffsetX = this.shadowOffsetX;
            ctx.shadowOffsetY = this.shadowOffsetY;
        } else {
            ctx.shadowColor = 'transparent';
        }
        
        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.textAlign = this.textAlign;
        ctx.textBaseline = this.textBaseline;
        ctx.fillText(this.text, pos.x, pos.y);
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
    
    /**
     * Get text width
     */
    getTextWidth(ctx) {
        let fontStyle = '';
        if (this.italic) fontStyle += 'italic ';
        if (this.bold) fontStyle += 'bold ';
        ctx.font = `${fontStyle}${this.fontSize}px ${this.fontFamily}`;
        return ctx.measureText(this.text).width;
    }
}

// ==================== Panel ====================

export class Panel extends UIElement {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.borderColor = '#ffffff';
        this.borderWidth = 2;
        this.borderRadius = 10;
        this.padding = 10;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        const bounds = this.getBounds(canvasWidth, canvasHeight);
        
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        
        if (this.borderRadius > 0) {
            this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        
        // Draw border
        if (this.borderWidth > 0) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            
            if (this.borderRadius > 0) {
                this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
    
    _drawRoundedRect(ctx, x, y, width, height, radius) {
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
    }
}

// ==================== Dialog ====================

export class Dialog extends Panel {
    constructor(x, y, width, height, title = '') {
        super(x, y, width, height);
        this.title = title;
        this.titleColor = '#ffffff';
        this.titleFontSize = 24;
        this.titleFontFamily = 'Arial';
        this.closeButton = null;
        this.onClose = null;
    }
    
    onEnter() {
        // Add close button if not present
        if (!this.closeButton) {
            this.closeButton = new Button(this.width - 40, 10, 30, 30, '×');
            this.closeButton.backgroundColor = '#ff4444';
            this.closeButton.hoverColor = '#cc0000';
            this.closeButton.onClick = () => {
                if (this.onClose) this.onClose();
            };
            this.addChild(this.closeButton);
        }
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        super.render(ctx, canvasWidth, canvasHeight);
        
        // Draw title
        if (this.title) {
            const bounds = this.getBounds(canvasWidth, canvasHeight);
            ctx.fillStyle = this.titleColor;
            ctx.font = `bold ${this.titleFontSize}px ${this.titleFontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            ctx.fillText(this.title, bounds.x + bounds.width / 2, bounds.y + 15);
        }
    }
}

// ==================== Score Display ====================

export class ScoreDisplay extends UIElement {
    constructor(x, y, score = 0) {
        super(x, y, 0, 0);
        this.score = score;
        this.label = 'Score';
        this.textColor = '#ffffff';
        this.labelColor = '#888888';
        this.fontSize = 24;
        this.labelFontSize = 16;
        this.fontFamily = 'Arial';
        this.textAlign = 'left';
        this.showLabel = true;
        this.animateScore = false;
        this.displayedScore = 0;
    }
    
    update(dt, input, canvasWidth, canvasHeight) {
        super.update(dt, input, canvasWidth, canvasHeight);
        
        if (this.animateScore) {
            this.displayedScore = lerp(this.displayedScore, this.score, 0.1);
            if (Math.abs(this.displayedScore - this.score) < 0.5) {
                this.displayedScore = this.score;
            }
        } else {
            this.displayedScore = this.score;
        }
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        const pos = this.getAbsolutePosition(canvasWidth, canvasHeight);
        
        if (this.showLabel) {
            // Draw label
            ctx.fillStyle = this.labelColor;
            ctx.font = `${this.labelFontSize}px ${this.fontFamily}`;
            ctx.textAlign = this.textAlign;
            ctx.textBaseline = 'top';
            ctx.fillText(this.label + ':', pos.x, pos.y);
            
            // Draw score
            ctx.fillStyle = this.textColor;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            ctx.fillText(Math.floor(this.displayedScore).toString(), pos.x + ctx.measureText(this.label + ': ').width, pos.y);
        } else {
            // Draw score only
            ctx.fillStyle = this.textColor;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            ctx.textAlign = this.textAlign;
            ctx.textBaseline = 'top';
            ctx.fillText(Math.floor(this.displayedScore).toString(), pos.x, pos.y);
        }
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
    
    setScore(score) {
        this.score = score;
    }
    
    addScore(amount) {
        this.score += amount;
    }
}

// ==================== Progress Bar ====================

export class ProgressBar extends UIElement {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.progress = 0;
        this.backgroundColor = '#333333';
        this.fillColor = '#4CAF50';
        this.borderColor = '#ffffff';
        this.borderWidth = 2;
        this.borderRadius = 5;
        this.showText = false;
        this.textColor = '#ffffff';
        this.fontSize = 14;
        this.fontFamily = 'Arial';
    }
    
    setProgress(progress) {
        this.progress = clamp(progress, 0, 1);
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible) return;
        
        const bounds = this.getBounds(canvasWidth, canvasHeight);
        
        // Draw background
        ctx.fillStyle = this.backgroundColor;
        
        if (this.borderRadius > 0) {
            this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
            ctx.fill();
        } else {
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        }
        
        // Draw fill
        if (this.progress > 0) {
            ctx.fillStyle = this.fillColor;
            
            if (this.borderRadius > 0) {
                this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width * this.progress, bounds.height, this.borderRadius);
                ctx.fill();
            } else {
                ctx.fillRect(bounds.x, bounds.y, bounds.width * this.progress, bounds.height);
            }
        }
        
        // Draw border
        if (this.borderWidth > 0) {
            ctx.strokeStyle = this.borderColor;
            ctx.lineWidth = this.borderWidth;
            
            if (this.borderRadius > 0) {
                this._drawRoundedRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, this.borderRadius);
                ctx.stroke();
            } else {
                ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            }
        }
        
        // Draw text
        if (this.showText) {
            ctx.fillStyle = this.textColor;
            ctx.font = `${this.fontSize}px ${this.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`${Math.floor(this.progress * 100)}%`, bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
        }
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
    
    _drawRoundedRect(ctx, x, y, width, height, radius) {
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
    }
}

// ==================== Image ====================

export class Image extends UIElement {
    constructor(x, y, width, height, imageElement) {
        super(x, y, width, height);
        this.imageElement = imageElement;
        this.sourceX = 0;
        this.sourceY = 0;
        this.sourceWidth = null;
        this.sourceHeight = null;
        this.tint = null;
        this.opacity = 1;
        this.rotation = 0;
    }
    
    render(ctx, canvasWidth, canvasHeight) {
        if (!this.visible || !this.imageElement) return;
        
        const bounds = this.getBounds(canvasWidth, canvasHeight);
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        
        // Apply rotation
        if (this.rotation !== 0) {
            ctx.translate(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
            ctx.rotate(this.rotation);
            ctx.translate(-(bounds.x + bounds.width / 2), -(bounds.y + bounds.height / 2));
        }
        
        // Apply tint
        if (this.tint) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillStyle = this.tint;
            ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            ctx.globalCompositeOperation = 'source-over';
        }
        
        // Draw image
        const sw = this.sourceWidth || this.imageElement.width;
        const sh = this.sourceHeight || this.imageElement.height;
        
        ctx.drawImage(
            this.imageElement,
            this.sourceX, this.sourceY, sw, sh,
            bounds.x, bounds.y, bounds.width, bounds.height
        );
        
        ctx.restore();
        
        super.render(ctx, canvasWidth, canvasHeight);
    }
}

// ==================== Layout Helpers ====================

/**
 * Create a horizontal layout
 */
export class HorizontalLayout extends UIElement {
    constructor(x, y, spacing = 10) {
        super(x, y, 0, 0);
        this.spacing = spacing;
    }
    
    addChild(child) {
        super.addChild(child);
        this._updateLayout();
        return child;
    }
    
    _updateLayout() {
        let totalWidth = 0;
        let maxHeight = 0;
        
        for (const child of this.children) {
            totalWidth += child.width;
            maxHeight = Math.max(maxHeight, child.height);
        }
        
        totalWidth += (this.children.length - 1) * this.spacing;
        this.width = totalWidth;
        this.height = maxHeight;
        
        let currentX = 0;
        for (const child of this.children) {
            child.x = currentX;
            child.y = (this.height - child.height) / 2;
            currentX += child.width + this.spacing;
        }
    }
}

/**
 * Create a vertical layout
 */
export class VerticalLayout extends UIElement {
    constructor(x, y, spacing = 10) {
        super(x, y, 0, 0);
        this.spacing = spacing;
    }
    
    addChild(child) {
        super.addChild(child);
        this._updateLayout();
        return child;
    }
    
    _updateLayout() {
        let totalHeight = 0;
        let maxWidth = 0;
        
        for (const child of this.children) {
            totalHeight += child.height;
            maxWidth = Math.max(maxWidth, child.width);
        }
        
        totalHeight += (this.children.length - 1) * this.spacing;
        this.width = maxWidth;
        this.height = totalHeight;
        
        let currentY = 0;
        for (const child of this.children) {
            child.x = (this.width - child.width) / 2;
            child.y = currentY;
            currentY += child.height + this.spacing;
        }
    }
}
