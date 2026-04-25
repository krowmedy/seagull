import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';

const DOG_SCALE = 0.4;
const DOG_GRAVITY = 600;
const DOG_MAX_FALL_SPEED = 500;
const DOG_WALK_SPEED = 80;

export class Dog extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'dog-walking',
    'assets/enemies/dog-walking.png',
    147,
    121,
    new Animation('dog-walk', 0, 7, 10, -1),
  );

  static preload(scene: Phaser.Scene): void {
    Dog.WALKING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Dog.WALKING.textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(DOG_SCALE);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(DOG_GRAVITY);
    body.setMaxVelocityY(DOG_MAX_FALL_SPEED);
    body.setVelocityX(-DOG_WALK_SPEED);
  }

  registerAnimations(): void {
    Dog.WALKING.registerAnimation(this.scene);
    if (Dog.WALKING.animation) {
      this.play(Dog.WALKING.animation.key);
    }
  }

  update(): void {
  }
}
