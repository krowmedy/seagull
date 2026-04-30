import * as Phaser from 'phaser';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import { BREAD } from '../config/LevelConfig.ts';
import type { StompOutcome } from './Enemy.ts';
import type { Seagull } from './Seagull.ts';

const MAN_SCALE = 0.7;
const MAN_GRAVITY = 600;
const MAN_MAX_FALL_SPEED = 500;
const MAN_WALK_SPEED = 80;
const MAN_HITS_TO_KILL = 3;
const MAN_HIT_FLASH_MS = 150;
const MAN_STOMP_POINTS = 100;
const MAN_ALERT_DELAY_MS = 500;
// The throw animation is 4 frames at 8fps = 500ms total. Release the stone
// halfway through, i.e. at the third frame's start, so the projectile leaves
// the man's hand on the forward-arm pose rather than after the follow-through.
const MAN_STONE_RELEASE_DELAY_MS = 250;
// Horizontal distance at which a Dormant man wakes up and starts walking. The
// camera viewport is 960px wide, so 500 means he activates roughly when the
// seagull would first see him at the right edge of the screen.
const MAN_ACTIVATION_RANGE = 500;

const ManState = {
  Dormant: 'dormant',
  Walking: 'walking',
  Alert: 'alert',
} as const;
type ManState = typeof ManState[keyof typeof ManState];

const THROW_ANIM_KEY = 'man-throw';
const WALK_ANIM_KEY = 'man-walk';
const STONE_THROW_EVENT = 'man-throw-stone';
const STONE_SPAWN_OFFSET_X = 40;
const STONE_SPAWN_OFFSET_Y = 30;

export type StoneThrowHandler = (x: number, y: number, targetX: number) => void;

export class Man extends Phaser.Physics.Arcade.Sprite {
  private static readonly WALKING = new Sprite(
    'man-walking',
    'assets/enemies/man-walking.png',
    139,
    222,
    new Animation(WALK_ANIM_KEY, 0, 3, 10, -1),
  );

  private static readonly THROWING = new Sprite(
    'man-throwing',
    'assets/enemies/man-throwing.png',
    217,
    222,
    new Animation(THROW_ANIM_KEY, 0, 3, 8, 0),
  );

  private hitsTaken = 0;
  private manState: ManState = ManState.Dormant;
  private alertTimer?: Phaser.Time.TimerEvent;
  private throwTimer?: Phaser.Time.TimerEvent;
  private readonly seagull: Seagull;

  static preload(scene: Phaser.Scene): void {
    Man.WALKING.load(scene);
    Man.THROWING.load(scene);
  }

  constructor(scene: Phaser.Scene, x: number, y: number, seagull: Seagull) {
    super(scene, x, y, Man.WALKING.textureKey);

    this.seagull = seagull;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(MAN_SCALE);

    const body = this.arcadeBody;
    body.setGravityY(MAN_GRAVITY);
    body.setMaxVelocityY(MAN_MAX_FALL_SPEED);
    // Horizontal velocity stays at 0 — the man holds his Dormant pose (frame
    // 0 of the walking sheet) until activate() runs.
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  registerAnimations(): void {
    Man.WALKING.registerAnimation(this.scene);
    Man.THROWING.registerAnimation(this.scene);
    // No auto-play. The man starts in Dormant and shows the walk sheet's
    // first frame statically; activate() plays the loop when he wakes.
  }

  stomp(): StompOutcome {
    this.hitsTaken += 1;
    if (this.hitsTaken < MAN_HITS_TO_KILL) {
      // A stomp from above always wakes a Dormant man — being landed on is
      // provocation enough; he doesn't need to wait for the proximity check.
      this.activateIfDormant();
      this.playHitEffect();
      this.scheduleAlertIfIdle();
      return { killed: false, points: 0 };
    }
    return { killed: true, points: MAN_STOMP_POINTS, drop: BREAD };
  }

  private activateIfDormant(): void {
    if (this.manState !== ManState.Dormant) return;
    this.manState = ManState.Walking;
    this.faceSeagull();
    this.play(WALK_ANIM_KEY);
    // Walk toward the seagull rather than always leftward — the man might be
    // woken by a seagull approaching from either side.
    const direction = this.flipX ? 1 : -1;
    this.arcadeBody.setVelocityX(direction * MAN_WALK_SPEED);
  }

  private scheduleAlertIfIdle(): void {
    // Only the FIRST stomp arms the timer; subsequent stomps within the 2s
    // window do not reset it. Once already Alert, no new timer is needed —
    // exitAlert() returns the man to Walking and clears alertTimer, so the
    // next stomp from Walking can arm a fresh one.
    if (this.manState !== ManState.Walking || this.alertTimer) return;
    this.alertTimer = this.scene.time.delayedCall(
      MAN_ALERT_DELAY_MS,
      () => this.enterAlert(),
    );
  }

  private enterAlert(): void {
    if (!this.active) return;
    this.alertTimer = undefined;
    this.manState = ManState.Alert;
    this.arcadeBody.setVelocityX(0);
    this.faceSeagull();
    this.play(THROW_ANIM_KEY);
    this.throwTimer = this.scene.time.delayedCall(
      MAN_STONE_RELEASE_DELAY_MS,
      () => {
        this.throwTimer = undefined;
        this.releaseStone();
      },
    );
    this.once(
      `animationcomplete-${THROW_ANIM_KEY}`,
      () => this.exitAlert(),
    );
  }

  private releaseStone(): void {
    if (!this.active) return;
    // Spawn from the man's throwing-arm side: flipX === true → facing right.
    // STONE_SPAWN_OFFSET_Y lifts the origin out of the torso so the arc reads
    // as a thrown stone rather than one rolling off a foot.
    const offsetX = this.flipX ? STONE_SPAWN_OFFSET_X : -STONE_SPAWN_OFFSET_X;
    this.emit(
      STONE_THROW_EVENT,
      this.x + offsetX,
      this.y - STONE_SPAWN_OFFSET_Y,
      this.seagull.x,
    );
  }

  onStoneThrow(handler: StoneThrowHandler): void {
    this.on(STONE_THROW_EVENT, handler);
  }

  private exitAlert(): void {
    if (!this.active) return;
    this.manState = ManState.Walking;
    this.play(WALK_ANIM_KEY);
    // The walking sprite faces left in its raw frames; flipX === true means the
    // man is now facing right after locking onto the seagull, so walk that way.
    const direction = this.flipX ? 1 : -1;
    this.arcadeBody.setVelocityX(direction * MAN_WALK_SPEED);
  }

  private faceSeagull(): void {
    this.setFlipX(this.seagull.x > this.x);
  }

  private cancelPendingTransitions(): void {
    this.alertTimer?.remove();
    this.alertTimer = undefined;
    this.throwTimer?.remove();
    this.throwTimer = undefined;
    this.off(`animationcomplete-${THROW_ANIM_KEY}`);
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

    this.cancelPendingTransitions();
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
    if (this.manState === ManState.Dormant) {
      if (Math.abs(this.seagull.x - this.x) < MAN_ACTIVATION_RANGE) {
        this.activateIfDormant();
      }
      return;
    }
    if (this.manState === ManState.Alert) {
      this.faceSeagull();
    }
  }
}
