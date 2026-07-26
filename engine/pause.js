import { Panel, Button, Label } from './UI.js';
import { SettingsMenu } from './SettingsMenu.js';

export class PauseOverlay {
  constructor(scene, onResume, onRestart, onMenu, onSettings) {
    this.scene = scene;
    this.onResume = onResume;
    this.onRestart = onRestart;
    this.onMenu = onMenu;
    this.onSettings = onSettings;
    this.visible = false;
    this.panel = null;
    this.settingsMenu = new SettingsMenu(scene, () => this.onSettingsClosed());
    this.createUI();
  }

  createUI() {
    const panelWidth = 300;
    const panelHeight = 400;
    const panel = new Panel(0, 0, panelWidth, panelHeight, 'rgba(0, 0, 0, 0.85)');
    panel.x = (this.scene.engine.width - panelWidth) / 2;
    panel.y = (this.scene.engine.height - panelHeight) / 2;
    
    const titleLabel = new Label(0, panel.y + 30, 'PAUSED', 32, '#ffffff');
    titleLabel.textAlign = 'center';
    titleLabel.x = this.scene.engine.width / 2;
    
    const btnWidth = 200;
    const btnHeight = 50;
    const btnX = (this.scene.engine.width - btnWidth) / 2;
    const startY = panel.y + 100;
    const gap = 60;
    
    const resumeBtn = new Button(btnX, startY, btnWidth, btnHeight, 'Resume', () => {
      this.hide();
      if (this.onResume) this.onResume();
    });
    resumeBtn.setShadow(5, 'rgba(0, 0, 0, 0.3)', 0, 2);
    
    const restartBtn = new Button(btnX, startY + gap, btnWidth, btnHeight, 'Restart', () => {
      this.hide();
      if (this.onRestart) this.onRestart();
    });
    restartBtn.setShadow(5, 'rgba(0, 0, 0, 0.3)', 0, 2);
    
    const settingsBtn = new Button(btnX, startY + gap * 2, btnWidth, btnHeight, 'Settings', () => {
      this.showSettings();
    });
    settingsBtn.setShadow(5, 'rgba(0, 0, 0, 0.3)', 0, 2);
    
    const menuBtn = new Button(btnX, startY + gap * 3, btnWidth, btnHeight, 'Main Menu', () => {
      this.hide();
      if (this.onMenu) this.onMenu();
    });
    menuBtn.setShadow(5, 'rgba(0, 0, 0, 0.3)', 0, 2);
    
    this.panel = panel;
    this.titleLabel = titleLabel;
    this.resumeBtn = resumeBtn;
    this.restartBtn = restartBtn;
    this.settingsBtn = settingsBtn;
    this.menuBtn = menuBtn;
  }

  show() {
    this.visible = true;
    this.scene.addUI(this.panel);
    this.scene.addUI(this.titleLabel);
    this.scene.addUI(this.resumeBtn);
    this.scene.addUI(this.restartBtn);
    this.scene.addUI(this.settingsBtn);
    this.scene.addUI(this.menuBtn);
    this.scene.pause();
  }

  hide() {
    this.visible = false;
    this.scene.removeUI(this.panel);
    this.scene.removeUI(this.titleLabel);
    this.scene.removeUI(this.resumeBtn);
    this.scene.removeUI(this.restartBtn);
    this.scene.removeUI(this.settingsBtn);
    this.scene.removeUI(this.menuBtn);
    this.scene.resume();
  }

  showSettings() {
    this.settingsMenu.show();
  }

  onSettingsClosed() {
    // Settings menu closed, return to pause menu
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
    if (this.visible) {
      this.settingsMenu.update(dt);
    }
  }

  render(ctx) {
    if (this.visible) {
      this.settingsMenu.render(ctx);
    }
  }

  handleClick(x, y) {
    if (!this.visible) return false;
    
    if (this.settingsMenu.isVisible()) {
      return this.settingsMenu.handleClick(x, y);
    }
    
    return false;
  }

  handleMouseMove(x, y) {
    if (this.visible && this.settingsMenu.isVisible()) {
      this.settingsMenu.handleMouseMove(x, y);
    }
  }

  handleMouseUp() {
    if (this.visible && this.settingsMenu.isVisible()) {
      this.settingsMenu.handleMouseUp();
    }
  }
}
