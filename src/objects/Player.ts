import * as Phaser from 'phaser';
import type { PlayerConfig } from '../config/PlayerConfig.ts';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly config: PlayerConfig;

  constructor(scene: Phaser.Scene, x: number, y: number, config: PlayerConfig) {
    super(scene, x, y, config.textureKey);
    this.config = config;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(config.scale);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(config.gravity);
    body.setMaxVelocityY(config.maxFallSpeed);
  }

  static preloadTexture(scene: Phaser.Scene, config: PlayerConfig): void {
    const gfx = scene.make.graphics({ x: 0, y: 0 });
    gfx.fillStyle(0xffffff);
    gfx.fillEllipse(24, 16, 48, 32);
    gfx.generateTexture(config.textureKey, 48, 32);
    gfx.destroy();
  }

  flap(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(-this.config.flapVelocity);
  }

  clampToBounds(): void {
    const { height } = this.scene.scale;
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.y <= 0) {
      this.y = 0;
      body.setVelocityY(0);
    } else if (this.y >= height) {
      this.y = height;
      body.setVelocityY(0);
    }
  }
}
