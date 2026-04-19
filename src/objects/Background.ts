import * as Phaser from 'phaser';
import type { LevelConfig } from '../config/LevelConfig.ts';

const TILE_W = 128;

export class Background {
  private readonly tileLayers: Array<{ sprite: Phaser.GameObjects.TileSprite; scrollFactor: number }> = [];

  constructor(scene: Phaser.Scene, config: LevelConfig) {
    const { width, height } = scene.scale;
    for (const layer of config.layers) {
      const sprite = scene.add.tileSprite(width / 2, height / 2, width, height, layer.tileKey);
      sprite.setScrollFactor(0);
      sprite.setDepth(layer.depth);
      this.tileLayers.push({ sprite, scrollFactor: layer.scrollFactor });
    }
  }

  update(cameraScrollX: number): void {
    for (const layer of this.tileLayers) {
      layer.sprite.tilePositionX = cameraScrollX * layer.scrollFactor;
    }
  }

  static preloadTextures(scene: Phaser.Scene, config: LevelConfig): void {
    const tileH = scene.scale.height;
    const skyH = Math.floor(tileH * 0.6);
    const sky = 0x1a1a2e;

    for (const layer of config.layers) {
      const gfx = scene.make.graphics({ x: 0, y: 0 });

      if (layer.tileKey === 'bg-sky') {
        gfx.fillStyle(sky);
        gfx.fillRect(0, 0, TILE_W, tileH);

      } else if (layer.tileKey === 'bg-distant') {
        // no sky fill — bg-sky layer handles that, keeping these shapes visible
        gfx.fillStyle(0x3a3d6b);
        gfx.fillRect(0,  skyH - 30, TILE_W, 30); // horizon band
        gfx.fillRect(10, skyH - 70, 40, 40);      // hill left
        gfx.fillRect(70, skyH - 55, 50, 25);      // hill right
        gfx.fillRect(52, skyH - 110, 10, 80);     // castle tower
        gfx.fillRect(46, skyH - 95,  22, 10);     // tower battlements
        gfx.fillRect(55, skyH - 130, 3,  25);     // spire

      } else if (layer.tileKey === 'bg-cityscape') {
        // no sky fill — only draw building shapes
        gfx.fillStyle(0x2a2a3e);
        gfx.fillRect(0, skyH, TILE_W, tileH - skyH);
        // varied rooflines
        gfx.fillRect(4,  skyH - 40, 36, 40);
        gfx.fillRect(48, skyH - 70, 28, 70);
        gfx.fillRect(88, skyH - 30, 34, 30);
        // lit windows
        gfx.fillStyle(0xd4a853);
        gfx.fillRect(12, skyH - 20, 8, 6);
        gfx.fillRect(56, skyH - 50, 6, 6);
        gfx.fillRect(56, skyH - 30, 6, 6);
        gfx.fillRect(96, skyH - 18, 8, 6);

      } else if (layer.tileKey === 'bg-foreground') {
        // no sky fill — only draw building shapes
        gfx.fillStyle(0x16182a);
        gfx.fillRect(0,  skyH - 45, 50, 45 + (tileH - skyH));
        gfx.fillRect(58, skyH - 30, 70, 30 + (tileH - skyH));
        // larger windows
        gfx.fillStyle(0xd4a853);
        gfx.fillRect(8,  skyH - 30, 12, 10);
        gfx.fillRect(26, skyH - 30, 12, 10);
        gfx.fillRect(66, skyH - 18, 14, 10);
        gfx.fillRect(84, skyH - 18, 14, 10);
      }

      gfx.generateTexture(layer.tileKey, TILE_W, tileH);
      gfx.destroy();
    }
  }
}
