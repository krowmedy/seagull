import * as Phaser from 'phaser';

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      'Seagull Game',
      { fontSize: '32px', color: '#ffffff' }
    ).setOrigin(0.5);
  }
}

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#1a1a2e',
  scene: [BootScene],
  parent: 'app',
});
