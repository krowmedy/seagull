import * as Phaser from 'phaser';

const SURFACE_HEIGHT = 30;
const SURFACE_COLOR = 0x3a2a1a;

export class Surface extends Phaser.GameObjects.Rectangle {
  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    const x = worldWidth / 2;
    const y = worldHeight - SURFACE_HEIGHT / 2;
    super(scene, x, y, worldWidth, SURFACE_HEIGHT, SURFACE_COLOR);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
