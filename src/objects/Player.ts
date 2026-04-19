import * as Phaser from 'phaser';
import type { PlayerConfig } from '../config/PlayerConfig.ts';
import { clampToBounds as applyClamp } from '../utils/clamp.ts';

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

  setHorizontalVelocity(vx: number): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(vx);
  }

  clampToBounds(): void {
    const wb = this.scene.physics.world.bounds;
    const body = this.body as Phaser.Physics.Arcade.Body;
    const { pos, vel } = applyClamp(
      { x: this.x, y: this.y },
      { x: body.velocity.x, y: body.velocity.y },
      { x: wb.x, y: wb.y, right: wb.right, bottom: wb.bottom },
    );
    this.x = pos.x;
    this.y = pos.y;
    body.setVelocityX(vel.x);
    body.setVelocityY(vel.y);
  }
}
