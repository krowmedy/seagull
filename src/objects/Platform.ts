import * as Phaser from 'phaser';
import type { PlatformConfig } from '../config/LevelConfig.ts';

export class Platform extends Phaser.GameObjects.Image {
  static preload(scene: Phaser.Scene, config: PlatformConfig): void {
    scene.load.image(config.textureKey, config.imagePath);
  }

  constructor(scene: Phaser.Scene, config: PlatformConfig) {
    const centerX = config.x + config.width / 2;
    const centerY = config.y + config.height / 2;
    super(scene, centerX, centerY, config.textureKey);
    this.setDisplaySize(config.width, config.height);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // StaticBody is sized from the source texture at creation time and does not
    // track setDisplaySize, so resize it explicitly to match the rendered size.
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.setSize(config.width, config.height);
    body.updateFromGameObject();

    // One-way platform: only block bodies landing from above.
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }
}
