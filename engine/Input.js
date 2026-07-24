/**
 * Input.js - Input Manager
 * Handles keyboard, mouse, and touch input with buffering and action mapping
 */

export class InputManager {
    constructor(canvas) {
        this.canvas = canvas;
        
        // Keyboard state
        this.keys = new Map();
        this.keysPressed = new Set();
        this.keysReleased = new Set();
        this.keyBuffer = [];
        this.bufferSize = 10;
        
        // Mouse state
        this.mouse = {
            x: 0,
            y: 0,
            buttons: new Map(),
            buttonsPressed: new Set(),
            buttonsReleased: new Set(),
            deltaX: 0,
            deltaY: 0,
            wheel: 0
        };
        
        // Touch state
        this.touches = new Map();
        this.touchesPressed = new Set();
        this.touchesReleased = new Set();
        
        // Action mapping
        this.actionMap = new Map();
        
        // Previous mouse position for delta calculation
        this.prevMouseX = 0;
        this.prevMouseY = 0;
        
        this._setupEventListeners();
    }
    
    /**
     * Setup event listeners
     */
    _setupEventListeners() {
        // Keyboard events
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));
        
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this._onTouchEnd(e));
        
        // Prevent default touch behavior
        this.canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
    
    /**
     * Keyboard down handler
     */
    _onKeyDown(e) {
        const code = e.code;
        
        if (!this.keys.has(code)) {
            this.keys.set(code, true);
            this.keysPressed.add(code);
            
            // Add to buffer
            this.keyBuffer.push({ code, time: performance.now() });
            if (this.keyBuffer.length > this.bufferSize) {
                this.keyBuffer.shift();
            }
        }
    }
    
    /**
     * Keyboard up handler
     */
    _onKeyUp(e) {
        const code = e.code;
        this.keys.set(code, false);
        this.keysReleased.add(code);
    }
    
    /**
     * Mouse move handler
     */
    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.prevMouseX = this.mouse.x;
        this.prevMouseY = this.mouse.y;
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.deltaX = this.mouse.x - this.prevMouseX;
        this.mouse.deltaY = this.mouse.y - this.prevMouseY;
    }
    
    /**
     * Mouse down handler
     */
    _onMouseDown(e) {
        const button = e.button;
        
        if (!this.mouse.buttons.has(button)) {
            this.mouse.buttons.set(button, true);
            this.mouse.buttonsPressed.add(button);
        }
    }
    
    /**
     * Mouse up handler
     */
    _onMouseUp(e) {
        const button = e.button;
        this.mouse.buttons.set(button, false);
        this.mouse.buttonsReleased.add(button);
    }
    
    /**
     * Mouse wheel handler
     */
    _onWheel(e) {
        this.mouse.wheel = e.deltaY;
    }
    
    /**
     * Touch start handler
     */
    _onTouchStart(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        for (let touch of e.changedTouches) {
            const id = touch.identifier;
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.touches.set(id, { x, y, startX: x, startY: y });
            this.touchesPressed.add(id);
        }
    }
    
    /**
     * Touch move handler
     */
    _onTouchMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        
        for (let touch of e.changedTouches) {
            const id = touch.identifier;
            const touchData = this.touches.get(id);
            
            if (touchData) {
                touchData.x = touch.clientX - rect.left;
                touchData.y = touch.clientY - rect.top;
                touchData.deltaX = touchData.x - touchData.startX;
                touchData.deltaY = touchData.y - touchData.startY;
            }
        }
    }
    
    /**
     * Touch end handler
     */
    _onTouchEnd(e) {
        for (let touch of e.changedTouches) {
            const id = touch.identifier;
            this.touches.delete(id);
            this.touchesReleased.add(id);
        }
    }
    
    /**
     * Update input state (call once per frame)
     */
    update(dt) {
        // Clear pressed/released states
        this.keysPressed.clear();
        this.keysReleased.clear();
        this.mouse.buttonsPressed.clear();
        this.mouse.buttonsReleased.clear();
        this.touchesPressed.clear();
        this.touchesReleased.clear();
        
        // Reset mouse delta
        this.mouse.deltaX = 0;
        this.mouse.deltaY = 0;
        this.mouse.wheel = 0;
    }
    
    /**
     * Check if key is currently down
     */
    isKeyDown(code) {
        return this.keys.get(code) || false;
    }
    
    /**
     * Check if key was pressed this frame
     */
    isKeyPressed(code) {
        return this.keysPressed.has(code);
    }
    
    /**
     * Check if key was released this frame
     */
    isKeyReleased(code) {
        return this.keysReleased.has(code);
    }
    
    /**
     * Get key buffer (recent key presses)
     */
    getKeyBuffer() {
        return [...this.keyBuffer];
    }
    
    /**
     * Clear key buffer
     */
    clearKeyBuffer() {
        this.keyBuffer = [];
    }
    
    /**
     * Get mouse position
     */
    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }
    
    /**
     * Get mouse delta
     */
    getMouseDelta() {
        return { x: this.mouse.deltaX, y: this.mouse.deltaY };
    }
    
    /**
     * Check if mouse button is down
     */
    isMouseButtonDown(button) {
        return this.mouse.buttons.get(button) || false;
    }
    
    /**
     * Check if mouse button was pressed this frame
     */
    isMouseButtonPressed(button) {
        return this.mouse.buttonsPressed.has(button);
    }
    
    /**
     * Check if mouse button was released this frame
     */
    isMouseButtonReleased(button) {
        return this.mouse.buttonsReleased.has(button);
    }
    
    /**
     * Get mouse wheel delta
     */
    getMouseWheel() {
        return this.mouse.wheel;
    }
    
    /**
     * Get touch by ID
     */
    getTouch(id) {
        return this.touches.get(id);
    }
    
    /**
     * Get all active touches
     */
    getAllTouches() {
        return Array.from(this.touches.entries()).map(([id, data]) => ({
            id,
            ...data
        }));
    }
    
    /**
     * Check if touch is active
     */
    isTouchActive(id) {
        return this.touches.has(id);
    }
    
    /**
     * Check if touch was pressed this frame
     */
    isTouchPressed(id) {
        return this.touchesPressed.has(id);
    }
    
    /**
     * Check if touch was released this frame
     */
    isTouchReleased(id) {
        return this.touchesReleased.has(id);
    }
    
    /**
     * Map keys/buttons to actions
     */
    mapAction(actionName, inputs) {
        this.actionMap.set(actionName, inputs);
    }
    
    /**
     * Check if action is active
     */
    isActionActive(actionName) {
        const inputs = this.actionMap.get(actionName);
        if (!inputs) return false;
        
        return inputs.some(input => {
            if (input.type === 'key') {
                return this.isKeyDown(input.code);
            } else if (input.type === 'mouseButton') {
                return this.isMouseButtonDown(input.button);
            } else if (input.type === 'touch') {
                return this.isTouchActive(input.id);
            }
            return false;
        });
    }
    
    /**
     * Check if action was triggered this frame
     */
    isActionTriggered(actionName) {
        const inputs = this.actionMap.get(actionName);
        if (!inputs) return false;
        
        return inputs.some(input => {
            if (input.type === 'key') {
                return this.isKeyPressed(input.code);
            } else if (input.type === 'mouseButton') {
                return this.isMouseButtonPressed(input.button);
            } else if (input.type === 'touch') {
                return this.isTouchPressed(input.id);
            }
            return false;
        });
    }
    
    /**
     * Check if action was released this frame
     */
    isActionReleased(actionName) {
        const inputs = this.actionMap.get(actionName);
        if (!inputs) return false;
        
        return inputs.some(input => {
            if (input.type === 'key') {
                return this.isKeyReleased(input.code);
            } else if (input.type === 'mouseButton') {
                return this.isMouseButtonReleased(input.button);
            } else if (input.type === 'touch') {
                return this.isTouchReleased(input.id);
            }
            return false;
        });
    }
    
    /**
     * Get all currently active keys
     */
    getActiveKeys() {
        const active = [];
        for (const [code, isDown] of this.keys) {
            if (isDown) active.push(code);
        }
        return active;
    }
    
    /**
     * Destroy input manager
     */
    destroy() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
        this.canvas.removeEventListener('mousemove', this._onMouseMove);
        this.canvas.removeEventListener('mousedown', this._onMouseDown);
        this.canvas.removeEventListener('mouseup', this._onMouseUp);
        this.canvas.removeEventListener('wheel', this._onWheel);
        this.canvas.removeEventListener('touchstart', this._onTouchStart);
        this.canvas.removeEventListener('touchmove', this._onTouchMove);
        this.canvas.removeEventListener('touchend', this._onTouchEnd);
        this.canvas.removeEventListener('touchcancel', this._onTouchEnd);
    }
}
