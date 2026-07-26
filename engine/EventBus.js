export class EventBus {
  constructor() {
    this.events = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;
    this.enabled = true;
  }

  on(event, callback, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    listeners.push({ callback, priority, once: false });
    
    // Sort by priority (higher priority first)
    listeners.sort((a, b) => b.priority - a.priority);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  once(event, callback, priority = 0) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    
    const listeners = this.events.get(event);
    listeners.push({ callback, priority, once: true });
    
    listeners.sort((a, b) => b.priority - a.priority);
    
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    
    const listeners = this.events.get(event);
    const index = listeners.findIndex(listener => listener.callback === callback);
    
    if (index > -1) {
      listeners.splice(index, 1);
    }
    
    if (listeners.length === 0) {
      this.events.delete(event);
    }
  }

  emit(event, data = null) {
    if (!this.enabled) return;
    
    // Add to history
    this.eventHistory.push({ event, data, timestamp: Date.now() });
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
    
    if (!this.events.has(event)) return;
    
    const listeners = [...this.events.get(event)];
    
    for (const listener of listeners) {
      try {
        listener.callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${event}:`, error);
      }
      
      if (listener.once) {
        this.off(event, listener.callback);
      }
    }
  }

  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }

  getEventHistory() {
    return [...this.eventHistory];
  }

  getListenerCount(event) {
    if (!this.events.has(event)) return 0;
    return this.events.get(event).length;
  }

  getAllEvents() {
    return Array.from(this.events.keys());
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled;
  }
}
