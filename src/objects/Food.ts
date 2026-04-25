import * as Phaser from 'phaser';
import type { FoodKind } from '../config/LevelConfig.ts';

export class Food extends Phaser.Physics.Arcade.Sprite {
  readonly points: number;

  static preload(scene: Phaser.Scene, kind: FoodKind): void {
    scene.load.image(kind.textureKey, kind.imagePath);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, kind: FoodKind) {
    super(scene, x, y, kind.textureKey);
    this.points = kind.points;

    if (kind.scale !== undefined) {
      this.setScale(kind.scale);
    }

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
