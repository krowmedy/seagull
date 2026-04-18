import * as Phaser from 'phaser';
import type { LevelConfig } from '../config/LevelConfig.ts';

export class Background {
  constructor(scene: Phaser.Scene, config: LevelConfig) {
    scene.add
      .tileSprite(
        config.worldWidth / 2,
        config.worldHeight / 2,
        config.worldWidth,
        config.worldHeight,
        config.bgTileKey,
      )
      .setDepth(-1);
  }

  static preloadTexture(scene: Phaser.Scene, config: LevelConfig): void {
    const tileW = 128;
    const tileH = 540;
    const skyH = Math.floor(tileH * 0.6); // 324px of sky

    const gfx = scene.make.graphics({ x: 0, y: 0 });

    // Sky
    gfx.fillStyle(0x1a1a2e);
    gfx.fillRect(0, 0, tileW, skyH);

    // Building silhouettes
    gfx.fillStyle(0x2a2a3e);
    gfx.fillRect(0, skyH, tileW, tileH - skyH);

    // Varied rooflines — three building blocks per tile
    gfx.fillStyle(0x2a2a3e);
    gfx.fillRect(4, skyH - 40, 36, 40);
    gfx.fillRect(48, skyH - 70, 28, 70);
    gfx.fillRect(88, skyH - 30, 34, 30);

    // A few lit windows
    gfx.fillStyle(0xd4a853);
    gfx.fillRect(12, skyH - 20, 8, 6);
    gfx.fillRect(56, skyH - 50, 6, 6);
    gfx.fillRect(56, skyH - 30, 6, 6);
    gfx.fillRect(96, skyH - 18, 8, 6);

    gfx.generateTexture(config.bgTileKey, tileW, tileH);
    gfx.destroy();
  }
}
