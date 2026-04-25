import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.ts';
const DEBUG = false;

// Phaser rasterizes text to canvas, so the webfont must be loaded before the
// scene's create() runs — otherwise the first paint uses a fallback face.
document.fonts.load('32px "Bangers"').finally(() => {
  new Phaser.Game({
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: '#1a1a2e',
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: DEBUG },
    },
    scene: [GameScene],
    parent: 'app',
  });
});
