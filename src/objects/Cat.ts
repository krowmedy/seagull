import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import type { StompOutcome } from './Enemy.ts';
import type { Seagull } from './Seagull.ts';

const CAT_SCALE = 0.4;
const CAT_GRAVITY = 600;
const CAT_MAX_FALL_SPEED = 500;
const CAT_WALK_SPEED = 80;
const CAT_STOMP_POINTS = 50;
// Horizontal distance at which a Dormant cat wakes up and starts walking.
// Matches MAN_ACTIVATION_RANGE (see Man.ts) — wakes roughly when the seagull
// would first see him at the edge of the 960px viewport.
const CAT_ACTIVATION_RANGE = 500;

const CatState = {
  Dormant: 'dormant',
  Walking: 'walking',
} as const;
type CatState = typeof CatState[keyof typeof CatState];

const WALK_ANIM_KEY = 'cat-walk';

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'cat-walking',
    'assets/enemies/cat-walking.png',
    136,
    121,
    new Animation(WALK_ANIM_KEY, 0, 7, 10, -1),
  );

  private catState: CatState = CatState.Dormant;
  private readonly seagull: Seagull;

  static preload(scene: Phaser.Scene): void {
    Cat.WALKING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, seagull: Seagull) {
    super(scene, x, y, Cat.WALKING.textureKey);

    this.seagull = seagull;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(CAT_SCALE);

    const body = this.arcadeBody;
    body.setGravityY(CAT_GRAVITY);
    body.setMaxVelocityY(CAT_MAX_FALL_SPEED);
    // Horizontal velocity stays at 0 — the cat holds her Dormant pose (frame
    // 0 of the walking sheet) until activateIfDormant() runs.
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  registerAnimations(): void {
    Cat.WALKING.registerAnimation(this.scene);
    // No auto-play. The cat starts in Dormant and shows the walk sheet's
    // first frame statically; activateIfDormant() plays the loop when she wakes.
  }

  stomp(): StompOutcome {
    return { killed: true, points: CAT_STOMP_POINTS };
  }

  private activateIfDormant(): void {
    if (this.catState !== CatState.Dormant) return;
    this.catState = CatState.Walking;
    this.play(WALK_ANIM_KEY);
    this.arcadeBody.setVelocityX(-CAT_WALK_SPEED);
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
    if (this.catState === CatState.Dormant) {
      if (Math.abs(this.seagull.x - this.x) < CAT_ACTIVATION_RANGE) {
        this.activateIfDormant();
      }
    }
  }
}
