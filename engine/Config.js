export class ConfigManager {
  constructor() {
    this.config = {};
    this.defaultConfig = {};
    this.configChangedCallbacks = [];
  }

  setDefaults(defaults) {
    this.defaultConfig = { ...defaults };
    this.config = { ...defaults };
  }

  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  set(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;
    
    // Notify callbacks
    this.configChangedCallbacks.forEach(callback => {
      try {
        callback(key, value, oldValue);
      } catch (error) {
        console.error('Error in config changed callback:', error);
      }
    });
  }

  reset(key) {
    if (key) {
      const defaultValue = this.getFromDefaults(key);
      if (defaultValue !== null) {
        this.set(key, defaultValue);
      }
    } else {
      this.config = { ...this.defaultConfig };
      this.configChangedCallbacks.forEach(callback => {
        try {
          callback(null, this.config, null);
        } catch (error) {
          console.error('Error in config changed callback:', error);
        }
      });
    }
  }

  getFromDefaults(key) {
    const keys = key.split('.');
    let value = this.defaultConfig;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value;
  }

  has(key) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return false;
      }
    }
    
    return true;
  }

  onChanged(callback) {
    this.configChangedCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.configChangedCallbacks.indexOf(callback);
      if (index > -1) {
        this.configChangedCallbacks.splice(index, 1);
      }
    };
  }

  load(config) {
    this.config = { ...this.defaultConfig, ...config };
  }

  save() {
    return { ...this.config };
  }

  getAll() {
    return { ...this.config };
  }
}
