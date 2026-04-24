import * as Phaser from 'phaser';
import type { SurfaceConfig } from '../config/LevelConfig.ts';

export class Surface extends Phaser.GameObjects.TileSprite {
  static preload(scene: Phaser.Scene, config: SurfaceConfig): void {
    scene.load.image(config.tileKey, config.imagePath);
  }

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number, config: SurfaceConfig) {
    const x = worldWidth / 2;
    const y = worldHeight - config.height / 2;
    super(scene, x, y, worldWidth, config.height, config.tileKey);

    const source = scene.textures.get(config.tileKey).getSourceImage();
    const tileScale = config.height / source.height;
    this.setTileScale(tileScale);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
