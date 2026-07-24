/**
 * Utils.js - Utility Library
 * Reusable helper functions for math, random, timers, interpolation, vectors, and colors
 */

// ==================== Random Numbers ====================

/**
 * Get random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get random float between min and max
 */
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Get random boolean
 */
export function randomBool() {
    return Math.random() < 0.5;
}

/**
 * Get random item from array
 */
export function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Shuffle array in place
 */
export function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Get random color
 */
export function randomColor() {
    return {
        r: randomInt(0, 255),
        g: randomInt(0, 255),
        b: randomInt(0, 255)
    };
}

/**
 * Get random hex color
 */
export function randomHexColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

// ==================== Timers ====================

/**
 * Create a timer
 */
export class Timer {
    constructor(duration) {
        this.duration = duration;
        this.remaining = duration;
        this.isRunning = false;
        this.isPaused = false;
        this.onComplete = null;
        this.onTick = null;
        this.lastTick = 0;
    }
    
    start() {
        this.isRunning = true;
        this.isPaused = false;
        this.lastTick = performance.now();
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.lastTick = performance.now();
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        this.remaining = this.duration;
    }
    
    reset() {
        this.remaining = this.duration;
        this.isRunning = false;
        this.isPaused = false;
    }
    
    update(dt) {
        if (!this.isRunning || this.isPaused) return;
        
        this.remaining -= dt;
        
        if (this.onTick) {
            this.onTick(this.remaining);
        }
        
        if (this.remaining <= 0) {
            this.remaining = 0;
            this.isRunning = false;
            if (this.onComplete) {
                this.onComplete();
            }
        }
    }
    
    getProgress() {
        return 1 - (this.remaining / this.duration);
    }
    
    isComplete() {
        return this.remaining <= 0;
    }
}

/**
 * Create a stopwatch
 */
export class Stopwatch {
    constructor() {
        this.isRunning = false;
        this.elapsed = 0;
        this.startTime = 0;
    }
    
    start() {
        this.isRunning = true;
        this.startTime = performance.now();
    }
    
    stop() {
        if (this.isRunning) {
            this.elapsed += performance.now() - this.startTime;
            this.isRunning = false;
        }
    }
    
    reset() {
        this.elapsed = 0;
        this.isRunning = false;
    }
    
    getElapsed() {
        if (this.isRunning) {
            return this.elapsed + (performance.now() - this.startTime);
        }
        return this.elapsed;
    }
    
    getElapsedSeconds() {
        return this.getElapsed() / 1000;
    }
}

// ==================== Interpolation ====================

/**
 * Linear interpolation
 */
export function lerp(a, b, t) {
    return a + (b - a) * t;
}

/**
 * Clamp value between min and max
 */
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

/**
 * Smooth step interpolation
 */
export function smoothStep(a, b, t) {
    const smoothT = t * t * (3 - 2 * t);
    return lerp(a, b, smoothT);
}

/**
 * Smoother step interpolation
 */
export function smootherStep(a, b, t) {
    const smoothT = t * t * t * (t * (t * 6 - 15) + 10);
    return lerp(a, b, smoothT);
}

/**
 * Ease in quad
 */
export function easeInQuad(t) {
    return t * t;
}

/**
 * Ease out quad
 */
export function easeOutQuad(t) {
    return t * (2 - t);
}

/**
 * Ease in out quad
 */
export function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

/**
 * Ease in cubic
 */
export function easeInCubic(t) {
    return t * t * t;
}

/**
 * Ease out cubic
 */
export function easeOutCubic(t) {
    return (--t) * t * t + 1;
}

/**
 * Ease in out cubic
 */
export function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

/**
 * Ease in elastic
 */
export function easeInElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
}

/**
 * Ease out elastic
 */
export function easeOutElastic(t) {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

/**
 * Ease in out elastic
 */
export function easeInOutElastic(t) {
    const c5 = (2 * Math.PI) / 4.5;
    return t === 0 ? 0 : t === 1 ? 1 : t < 0.5
        ? -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2
        : (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
}

/**
 * Ease in bounce
 */
export function easeInBounce(t) {
    return 1 - easeOutBounce(1 - t);
}

/**
 * Ease out bounce
 */
export function easeOutBounce(t) {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
        return n1 * t * t;
    } else if (t < 2 / d1) {
        return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
        return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
        return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
}

/**
 * Ease in out bounce
 */
export function easeInOutBounce(t) {
    return t < 0.5
        ? (1 - easeOutBounce(1 - 2 * t)) / 2
        : (1 + easeOutBounce(2 * t - 1)) / 2;
}

// ==================== Math Helpers ====================

/**
 * Map value from one range to another
 */
export function map(value, inMin, inMax, outMin, outMax) {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

/**
 * Convert degrees to radians
 */
export function degToRad(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
export function radToDeg(radians) {
    return radians * (180 / Math.PI);
}

/**
 * Check if number is in range
 */
export function inRange(value, min, max) {
    return value >= min && value <= max;
}

/**
 * Wrap value between min and max
 */
export function wrap(value, min, max) {
    const range = max - min;
    return ((value - min) % range + range) % range + min;
}

/**
 * Round to decimal places
 */
export function roundTo(value, decimals) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

/**
 * Get distance between two points
 */
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Get angle between two points
 */
export function angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/**
 * Normalize angle to -PI to PI
 */
export function normalizeAngle(angle) {
    while (angle > Math.PI) angle -= 2 * Math.PI;
    while (angle < -Math.PI) angle += 2 * Math.PI;
    return angle;
}

/**
 * Check if value is power of two
 */
export function isPowerOfTwo(value) {
    return value > 0 && (value & (value - 1)) === 0;
}

/**
 * Get next power of two
 */
export function nextPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log2(value)));
}

// ==================== Vector Operations ====================

/**
 * Create a vector
 */
export function vec2(x, y) {
    return { x, y };
}

/**
 * Add two vectors
 */
export function vec2Add(v1, v2) {
    return { x: v1.x + v2.x, y: v1.y + v2.y };
}

/**
 * Subtract two vectors
 */
export function vec2Sub(v1, v2) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

/**
 * Multiply vector by scalar
 */
export function vec2Mul(v, scalar) {
    return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Divide vector by scalar
 */
export function vec2Div(v, scalar) {
    return { x: v.x / scalar, y: v.y / scalar };
}

/**
 * Get vector length
 */
export function vec2Length(v) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalize vector
 */
export function vec2Normalize(v) {
    const length = vec2Length(v);
    if (length === 0) return { x: 0, y: 0 };
    return vec2Div(v, length);
}

/**
 * Get dot product of two vectors
 */
export function vec2Dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Get cross product of two vectors (2D)
 */
export function vec2Cross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Get distance between two vectors
 */
export function vec2Distance(v1, v2) {
    return vec2Length(vec2Sub(v2, v1));
}

/**
 * Lerp between two vectors
 */
export function vec2Lerp(v1, v2, t) {
    return {
        x: lerp(v1.x, v2.x, t),
        y: lerp(v1.y, v2.y, t)
    };
}

/**
 * Rotate vector by angle
 */
export function vec2Rotate(v, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return {
        x: v.x * cos - v.y * sin,
        y: v.x * sin + v.y * cos
    };
}

/**
 * Get angle of vector
 */
export function vec2Angle(v) {
    return Math.atan2(v.y, v.x);
}

/**
 * Reflect vector off normal
 */
export function vec2Reflect(v, normal) {
    const dot = vec2Dot(v, normal);
    return vec2Sub(v, vec2Mul(normal, 2 * dot));
}

/**
 * Project vector onto another
 */
export function vec2Project(v, onto) {
    const dot = vec2Dot(v, onto);
    const ontoLengthSquared = vec2Dot(onto, onto);
    if (ontoLengthSquared === 0) return { x: 0, y: 0 };
    return vec2Mul(onto, dot / ontoLengthSquared);
}

// ==================== Color Helpers ====================

/**
 * Convert RGB to hex
 */
export function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.round(clamp(x, 0, 255)).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

/**
 * Convert hex to RGB
 */
export function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * Convert RGB to HSL
 */
export function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    return {
        h: h * 360,
        s: s * 100,
        l: l * 100
    };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Lighten or darken a color
 */
export function adjustBrightness(color, amount) {
    const rgb = typeof color === 'string' ? hexToRgb(color) : color;
    if (!rgb) return color;
    
    return {
        r: clamp(rgb.r + amount, 0, 255),
        g: clamp(rgb.g + amount, 0, 255),
        b: clamp(rgb.b + amount, 0, 255)
    };
}

/**
 * Blend two colors
 */
export function blendColors(color1, color2, t) {
    const rgb1 = typeof color1 === 'string' ? hexToRgb(color1) : color1;
    const rgb2 = typeof color2 === 'string' ? hexToRgb(color2) : color2;
    
    if (!rgb1 || !rgb2) return color1;
    
    return {
        r: Math.round(lerp(rgb1.r, rgb2.r, t)),
        g: Math.round(lerp(rgb1.g, rgb2.g, t)),
        b: Math.round(lerp(rgb1.b, rgb2.b, t))
    };
}

/**
 * Convert color to CSS string
 */
export function colorToCss(color) {
    if (typeof color === 'string') return color;
    return `rgb(${color.r}, ${color.g}, ${color.b})`;
}

/**
 * Convert color to CSS string with alpha
 */
export function colorToCssRgba(color, alpha) {
    if (typeof color === 'string') {
        const rgb = hexToRgb(color);
        if (rgb) {
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
        }
        return color;
    }
    return `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
}

// ==================== Other Utilities ====================

/**
 * Deep clone an object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

/**
 * Debounce a function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle a function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Format time as MM:SS
 */
export function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format number with commas
 */
export function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Check if point is in circle sector
 */
export function pointInSector(point, circle, startAngle, endAngle) {
    const dx = point.x - circle.x;
    const dy = point.y - circle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > circle.radius) return false;
    
    let angle = Math.atan2(dy, dx);
    angle = normalizeAngle(angle);
    
    startAngle = normalizeAngle(startAngle);
    endAngle = normalizeAngle(endAngle);
    
    if (startAngle > endAngle) {
        return angle >= startAngle || angle <= endAngle;
    }
    
    return angle >= startAngle && angle <= endAngle;
}
