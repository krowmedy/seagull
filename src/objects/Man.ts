import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import { BREAD } from '../config/LevelConfig.ts';
import type { StompOutcome } from './Enemy.ts';

const MAN_SCALE = 0.7;
const MAN_GRAVITY = 600;
const MAN_MAX_FALL_SPEED = 500;
const MAN_WALK_SPEED = 80;
const MAN_HITS_TO_KILL = 3;
const MAN_HIT_FLASH_MS = 150;
const MAN_STOMP_POINTS = 100;

export class Man extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'man-walking',
    'assets/enemies/man-walking.png',
    139,
    222,
    new Animation('man-walk', 0, 3, 10, -1),
  );

  private hitsTaken = 0;

  static preload(scene: Phaser.Scene): void {
    Man.WALKING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Man.WALKING.textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(MAN_SCALE);

    const body = this.arcadeBody;
    body.setGravityY(MAN_GRAVITY);
    body.setMaxVelocityY(MAN_MAX_FALL_SPEED);
    body.setVelocityX(-MAN_WALK_SPEED);
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  registerAnimations(): void {
    Man.WALKING.registerAnimation(this.scene);
    if (Man.WALKING.animation) {
      this.play(Man.WALKING.animation.key);
    }
  }

  stomp(): StompOutcome {
    this.hitsTaken += 1;
    if (this.hitsTaken < MAN_HITS_TO_KILL) {
      this.playHitEffect();
      return { killed: false, points: 0 };
    }
    return { killed: true, points: MAN_STOMP_POINTS, drop: BREAD };
  }

  private playHitEffect(): void {
    this.setTint(0xff5555);
    this.scene.time.delayedCall(MAN_HIT_FLASH_MS, () => {
      // Guard against the man dying or being destroyed during the delay.
      if (this.active) this.clearTint();
    });
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
