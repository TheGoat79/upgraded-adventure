import { Panel, Button, Label } from './UI.js';

export class SettingsMenu {
  constructor(scene, onClose) {
    this.scene = scene;
    this.onClose = onClose;
    this.visible = false;
    this.panel = null;
    this.sliders = [];
    this.createUI();
  }

  createUI() {
    const panelWidth = 400;
    const panelHeight = 500;
    const panel = new Panel(0, 0, panelWidth, panelHeight, 'rgba(0, 0, 0, 0.9)');
    panel.x = (this.scene.engine.width - panelWidth) / 2;
    panel.y = (this.scene.engine.height - panelHeight) / 2;
    
    const titleLabel = new Label(0, panel.y + 30, 'SETTINGS', 32, '#ffffff');
    titleLabel.textAlign = 'center';
    titleLabel.x = this.scene.engine.width / 2;
    
    // Volume settings
    const startY = panel.y + 80;
    const gap = 60;
    
    this.musicVolumeLabel = new Label(panel.x + 20, startY, 'Music Volume: 50%', 16, '#ffffff');
    this.musicVolumeSlider = this.createSlider(panel.x + 20, startY + 25, panelWidth - 40, 0.5, (value) => {
      this.musicVolumeLabel.text = `Music Volume: ${Math.round(value * 100)}%`;
      if (window.audio) window.audio.setMusicVolume(value);
    });
    
    this.sfxVolumeLabel = new Label(panel.x + 20, startY + gap, 'SFX Volume: 70%', 16, '#ffffff');
    this.sfxVolumeSlider = this.createSlider(panel.x + 20, startY + gap + 25, panelWidth - 40, 0.7, (value) => {
      this.sfxVolumeLabel.text = `SFX Volume: ${Math.round(value * 100)}%`;
      if (window.audio) window.audio.setSfxVolume(value);
    });
    
    this.masterVolumeLabel = new Label(panel.x + 20, startY + gap * 2, 'Master Volume: 100%', 16, '#ffffff');
    this.masterVolumeSlider = this.createSlider(panel.x + 20, startY + gap * 2 + 25, panelWidth - 40, 1.0, (value) => {
      this.masterVolumeLabel.text = `Master Volume: ${Math.round(value * 100)}%`;
      if (window.audio) window.audio.setMasterVolume(value);
    });
    
    // Reset button
    const resetBtn = new Button(
      panel.x + 20,
      startY + gap * 3.5,
      panelWidth - 40,
      40,
      'Reset to Defaults',
      () => this.resetToDefaults()
    );
    resetBtn.backgroundColor = '#e74c3c';
    resetBtn.hoverColor = '#ff6b6b';
    resetBtn.pressedColor = '#c0392b';
    
    // Close button
    const closeBtn = new Button(
      panel.x + 20,
      panel.y + panelHeight - 60,
      panelWidth - 40,
      40,
      'Close',
      () => this.hide()
    );
    closeBtn.backgroundColor = '#3498db';
    closeBtn.hoverColor = '#5dade2';
    closeBtn.pressedColor = '#2980b9';
    
    this.panel = panel;
    this.titleLabel = titleLabel;
    this.resetBtn = resetBtn;
    this.closeBtn = closeBtn;
  }

  createSlider(x, y, width, initialValue, onChange) {
    return {
      x,
      y,
      width,
      height: 20,
      value: initialValue,
      onChange,
      dragging: false
    };
  }

  resetToDefaults() {
    this.musicVolumeSlider.value = 0.5;
    this.musicVolumeLabel.text = 'Music Volume: 50%';
    if (window.audio) window.audio.setMusicVolume(0.5);
    
    this.sfxVolumeSlider.value = 0.7;
    this.sfxVolumeLabel.text = 'SFX Volume: 70%';
    if (window.audio) window.audio.setSfxVolume(0.7);
    
    this.masterVolumeSlider.value = 1.0;
    this.masterVolumeLabel.text = 'Master Volume: 100%';
    if (window.audio) window.audio.setMasterVolume(1.0);
  }

  show() {
    this.visible = true;
    
    // Load current values
    if (window.audio) {
      this.musicVolumeSlider.value = window.audio.getMusicVolume();
      this.musicVolumeLabel.text = `Music Volume: ${Math.round(this.musicVolumeSlider.value * 100)}%`;
      
      this.sfxVolumeSlider.value = window.audio.getSfxVolume();
      this.sfxVolumeLabel.text = `SFX Volume: ${Math.round(this.sfxVolumeSlider.value * 100)}%`;
      
      this.masterVolumeSlider.value = window.audio.getMasterVolume();
      this.masterVolumeLabel.text = `Master Volume: ${Math.round(this.masterVolumeSlider.value * 100)}%`;
    }
    
    this.scene.addUI(this.panel);
    this.scene.addUI(this.titleLabel);
    this.scene.addUI(this.musicVolumeLabel);
    this.scene.addUI(this.sfxVolumeLabel);
    this.scene.addUI(this.masterVolumeLabel);
    this.scene.addUI(this.resetBtn);
    this.scene.addUI(this.closeBtn);
  }

  hide() {
    this.visible = false;
    this.scene.removeUI(this.panel);
    this.scene.removeUI(this.titleLabel);
    this.scene.removeUI(this.musicVolumeLabel);
    this.scene.removeUI(this.sfxVolumeLabel);
    this.scene.removeUI(this.masterVolumeLabel);
    this.scene.removeUI(this.resetBtn);
    this.scene.removeUI(this.closeBtn);
    
    if (this.onClose) {
      this.onClose();
    }
  }

  toggle() {
    if (this.visible) {
      this.hide();
    } else {
      this.show();
    }
  }

  isVisible() {
    return this.visible;
  }

  update(dt) {
    if (!this.visible) return;
  }

  render(ctx) {
    if (!this.visible) return;
    
    // Render sliders
    [this.musicVolumeSlider, this.sfxVolumeSlider, this.masterVolumeSlider].forEach(slider => {
      this.renderSlider(ctx, slider);
    });
  }

  renderSlider(ctx, slider) {
    const { x, y, width, height, value } = slider;
    
    // Background
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(x, y, width, height);
    
    // Fill
    ctx.fillStyle = '#3498db';
    ctx.fillRect(x, y, width * value, height);
    
    // Handle
    const handleX = x + width * value;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(handleX, y + height / 2, height / 2 + 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Border
    ctx.strokeStyle = '#4a90d9';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
  }

  handleClick(x, y) {
    if (!this.visible) return false;
    
    // Check slider clicks
    const sliders = [this.musicVolumeSlider, this.sfxVolumeSlider, this.masterVolumeSlider];
    for (const slider of sliders) {
      if (x >= slider.x && x <= slider.x + slider.width &&
          y >= slider.y && y <= slider.y + slider.height) {
        slider.dragging = true;
        this.updateSliderValue(slider, x);
        return true;
      }
    }
    
    return false;
  }

  handleMouseMove(x, y) {
    if (!this.visible) return;
    
    const sliders = [this.musicVolumeSlider, this.sfxVolumeSlider, this.masterVolumeSlider];
    for (const slider of sliders) {
      if (slider.dragging) {
        this.updateSliderValue(slider, x);
      }
    }
  }

  handleMouseUp() {
    if (!this.visible) return;
    
    const sliders = [this.musicVolumeSlider, this.sfxVolumeSlider, this.masterVolumeSlider];
    for (const slider of sliders) {
      slider.dragging = false;
    }
  }

  updateSliderValue(slider, mouseX) {
    const relativeX = mouseX - slider.x;
    const value = Math.max(0, Math.min(1, relativeX / slider.width));
    slider.value = value;
    
    if (slider.onChange) {
      slider.onChange(value);
    }
  }
}
