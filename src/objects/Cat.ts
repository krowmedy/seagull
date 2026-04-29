import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import type { StompOutcome } from './Enemy.ts';

const CAT_SCALE = 0.4;
const CAT_GRAVITY = 600;
const CAT_MAX_FALL_SPEED = 500;
const CAT_WALK_SPEED = 80;
const CAT_STOMP_POINTS = 50;

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'cat-walking',
    'assets/enemies/cat-walking.png',
    136,
    121,
    new Animation('cat-walk', 0, 7, 10, -1),
  );

  static preload(scene: Phaser.Scene): void {
    Cat.WALKING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Cat.WALKING.textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(CAT_SCALE);

    const body = this.arcadeBody;
    body.setGravityY(CAT_GRAVITY);
    body.setMaxVelocityY(CAT_MAX_FALL_SPEED);
    body.setVelocityX(-CAT_WALK_SPEED);
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  registerAnimations(): void {
    Cat.WALKING.registerAnimation(this.scene);
    if (Cat.WALKING.animation) {
      this.play(Cat.WALKING.animation.key);
    }
  }

  stomp(): StompOutcome {
    return { killed: true, points: CAT_STOMP_POINTS };
  }

  die(): void {
    const scene = this.scene;
    const baseScale = this.scaleX || 1;

    this.arcadeBody.enable = false;
    this.stop();

    scene.tweens.killTweensOf(this);
    scene.tweens.add({
      targets: this,
      scaleX: baseScale * 1.6,
      scaleY: baseScale * 1.6,
      alpha: 0,
      duration: 180,
      ease: 'Quad.easeOut',
      onComplete: () => this.destroy(),
    });
  }

  update(): void {
  }
}
