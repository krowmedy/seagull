import * as Phaser from 'phaser';

const STONE_RADIUS = 8;
const STONE_HORIZONTAL_SPEED = 240;
const STONE_VERTICAL_LIFT = 200;
const STONE_GRAVITY = 600;
const STONE_COLOR = 0x333333;
const STONE_TEXTURE_KEY = 'stone-circle';
const STONE_LIFETIME_MS = 5000;

export class Stone extends Phaser.Physics.Arcade.Image {
  static preload(scene: Phaser.Scene): void {
    if (scene.textures.exists(STONE_TEXTURE_KEY)) return;
    const size = STONE_RADIUS * 2;
    const g = scene.make.graphics();
    g.fillStyle(STONE_COLOR, 1);
    g.fillCircle(STONE_RADIUS, STONE_RADIUS, STONE_RADIUS);
    g.generateTexture(STONE_TEXTURE_KEY, size, size);
    g.destroy();
  }

  constructor(scene: Phaser.Scene, x: number, y: number, targetX: number) {
    super(scene, x, y, STONE_TEXTURE_KEY);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setCircle(STONE_RADIUS);
    body.setGravityY(STONE_GRAVITY);

    const direction = targetX >= x ? 1 : -1;
    body.setVelocityX(direction * STONE_HORIZONTAL_SPEED);
    body.setVelocityY(-STONE_VERTICAL_LIFT);

    // Failsafe for stones that miss everything and fly off-world — without this
    // they would persist (and keep their listeners) for the rest of the level.
    scene.time.delayedCall(STONE_LIFETIME_MS, () => {
      if (this.active) this.destroy();
    });
  }
}
