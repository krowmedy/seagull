import * as Phaser from 'phaser';
import { GameScene } from './scenes/GameScene.ts';
const DEBUG = false;

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  backgroundColor: '#1a1a2e',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 0 }, debug: DEBUG },
    matter: {debug: DEBUG}
  },
  scene: [GameScene],
  parent: 'app',
});
