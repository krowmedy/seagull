import * as Phaser from 'phaser';
import type { PlatformConfig } from '../config/LevelConfig.ts';

const PLACEHOLDER_FILL = 0xFFD23F;

export class Platform extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, config: PlatformConfig) {
    const centerX = config.x + config.width / 2;
    const centerY = config.y + config.height / 2;
    // TODO: when config.textureKey is set, render with a sprite instead of a placeholder rectangle.
    super(scene, centerX, centerY, config.width, config.height, PLACEHOLDER_FILL);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // One-way platform: only block bodies landing from above.
    const body = this.body as Phaser.Physics.Arcade.StaticBody;
    body.checkCollision.down = false;
    body.checkCollision.left = false;
    body.checkCollision.right = false;
  }
}
