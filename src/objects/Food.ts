import * as Phaser from 'phaser';
import type { FoodKind } from '../config/LevelConfig.ts';

export class Food extends Phaser.Physics.Arcade.Sprite {
  readonly points: number;
  readonly pickupSoundKey?: string;
  readonly pickupSoundVolume?: number;

  static preload(scene: Phaser.Scene, kind: FoodKind): void {
    scene.load.image(kind.textureKey, kind.imagePath);
    if (kind.pickupSound) {
      scene.load.audio(kind.pickupSound.key, kind.pickupSound.path);
    }
  }

  constructor(scene: Phaser.Scene, x: number, y: number, kind: FoodKind) {
    super(scene, x, y, kind.textureKey);
    this.points = kind.points;
    this.pickupSoundKey = kind.pickupSound?.key;
    this.pickupSoundVolume = kind.pickupSound?.volume;

    if (kind.scale !== undefined) {
      this.setScale(kind.scale);
    }

    scene.add.existing(this);
    scene.physics.add.existing(this, true);

    // Make the bread bob up and down.
    scene.tweens.add({
      targets: this,
      y: y - 6,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  pickup(): void {
    const scene = this.scene;
    const baseScale = this.scaleX || 1;

    if (this.body) {
      (this.body as Phaser.Physics.Arcade.StaticBody).enable = false;
    }
    // Fade the food out when picked up before destroying.
    scene.tweens.killTweensOf(this);
    scene.tweens.add({
      targets: this,
      scaleX: baseScale * 1.6,
      scaleY: baseScale * 1.6,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy(),
    });
  }
}
