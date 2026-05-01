import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import type { StompOutcome } from './Enemy.ts';
import type { Seagull } from './Seagull.ts';

const DOG_SCALE = 0.4;
const DOG_GRAVITY = 600;
const DOG_MAX_FALL_SPEED = 500;
const DOG_WALK_SPEED = 80;
const DOG_STOMP_POINTS = 50;
// Horizontal distance at which a Dormant dog wakes up and starts walking.
// Matches MAN_ACTIVATION_RANGE (see Man.ts) — wakes roughly when the seagull
// would first see him at the edge of the 960px viewport.
const DOG_ACTIVATION_RANGE = 500;

const DogState = {
  Dormant: 'dormant',
  Walking: 'walking',
} as const;
type DogState = typeof DogState[keyof typeof DogState];

const WALK_ANIM_KEY = 'dog-walk';

export class Dog extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'dog-walking',
    'assets/enemies/dog-walking.png',
    147,
    121,
    new Animation(WALK_ANIM_KEY, 0, 7, 10, -1),
  );

  private dogState: DogState = DogState.Dormant;
  private readonly seagull: Seagull;

  static preload(scene: Phaser.Scene): void {
    Dog.WALKING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, seagull: Seagull) {
    super(scene, x, y, Dog.WALKING.textureKey);

    this.seagull = seagull;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(DOG_SCALE);

    const body = this.arcadeBody;
    body.setGravityY(DOG_GRAVITY);
    body.setMaxVelocityY(DOG_MAX_FALL_SPEED);
    // Horizontal velocity stays at 0 — the dog holds his Dormant pose (frame
    // 0 of the walking sheet) until activateIfDormant() runs.
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  registerAnimations(): void {
    Dog.WALKING.registerAnimation(this.scene);
    // No auto-play. The dog starts in Dormant and shows the walk sheet's
    // first frame statically; activateIfDormant() plays the loop when he wakes.
  }

  stomp(): StompOutcome {
    return { killed: true, points: DOG_STOMP_POINTS };
  }

  private activateIfDormant(): void {
    if (this.dogState !== DogState.Dormant) return;
    this.dogState = DogState.Walking;
    this.play(WALK_ANIM_KEY);
    this.arcadeBody.setVelocityX(-DOG_WALK_SPEED);
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
    if (this.dogState === DogState.Dormant) {
      if (Math.abs(this.seagull.x - this.x) < DOG_ACTIVATION_RANGE) {
        this.activateIfDormant();
      }
    }
  }
}
