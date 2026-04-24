import type * as Phaser from 'phaser';
import type { LevelConfig } from '../config/LevelConfig.ts';

interface BackgroundLayer {
  sprite: Phaser.GameObjects.TileSprite;
  scrollFactor: number;
  tileScale: number;
}

export class Background {
  private readonly tileLayers: BackgroundLayer[] = [];

  constructor(scene: Phaser.Scene, config: LevelConfig) {
    const { width, height } = scene.scale;
    for (const layer of config.layers) {
      const sprite = scene.add.tileSprite(width / 2, height / 2, width, height, layer.tileKey);
      sprite.setScrollFactor(0);
      sprite.setDepth(layer.depth);

      const source = scene.textures.get(layer.tileKey).getSourceImage();
      const tileScale = height / source.height;
      sprite.setTileScale(tileScale);

      if (layer.tint !== undefined) {
        sprite.setTint(layer.tint);
      }

      this.tileLayers.push({ sprite, scrollFactor: layer.scrollFactor, tileScale });
    }
  }

  update(cameraScrollX: number): void {
    for (const layer of this.tileLayers) {
      layer.sprite.tilePositionX = (cameraScrollX * layer.scrollFactor) / layer.tileScale;
    }
  }

  static preloadTextures(scene: Phaser.Scene, config: LevelConfig): void {
    for (const layer of config.layers) {
      scene.load.image(layer.tileKey, layer.imagePath);
    }
  }
}
