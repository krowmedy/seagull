import * as Phaser from 'phaser';
import { Character, type PhysicsParams } from './Character.ts';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import { CharacterState } from '../config/CharacterState.ts';

const SEAGULL_PHYSICS: PhysicsParams = {
  gravity: 600,
  maxFallSpeed: 500,
  scale: 0.45,
};

const FLAP_VELOCITY = 350;
const HORIZONTAL_SPEED = 250;

export class Seagull extends Character {
  points = 0;

  private static readonly FLYING = new Sprite(
    'seagull-flying',
    'assets/seagull/seagull-flying.png',
    309,
    202,
    new Animation('fly', 0, 3, 8, -1),
  );

  private static readonly WALKING = new Sprite(
    'seagull-walking',
    'assets/seagull/seagull-walking.png',
    179,
    162,
    new Animation('walk', 0, 3, 8, -1),
  );

  private static readonly STANDING = new Sprite(
    'seagull-standing',
    'assets/seagull/seagull-standing.png',
    179,
    162,
    new Animation('stand', 0, 0, 1, -1),
  );

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Seagull.FLYING, CharacterState.Flying, SEAGULL_PHYSICS);
    this.applySmallerHitbox();
  }

  private applySmallerHitbox() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(179, 162);
  }

  protected spriteFor(state: CharacterState): Sprite {
    switch (state) {
      case CharacterState.Flying:
        return Seagull.FLYING;
      case CharacterState.Walking:
        return Seagull.WALKING;
      case CharacterState.Standing:
        return Seagull.STANDING;
    }
  }

  protected get allSprites(): readonly Sprite[] {
    return [Seagull.FLYING, Seagull.WALKING, Seagull.STANDING];
  }

  static preload(scene: Phaser.Scene): void {
    Seagull.FLYING.load(scene);
    Seagull.WALKING.load(scene);
    Seagull.STANDING.load(scene);
    }

  override setCharacterState(state: CharacterState): void {
    super.setCharacterState(state);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (state === CharacterState.Walking || state === CharacterState.Standing) {
      body.setGravityY(0);
      body.setVelocityY(0);
    } else {
      this.applySmallerHitbox()
      body.setGravityY(SEAGULL_PHYSICS.gravity);
    }
  }

  flap(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(-FLAP_VELOCITY);
  }

  moveLeft(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(-HORIZONTAL_SPEED);
  }

  moveRight(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(HORIZONTAL_SPEED);
  }

  stopHorizontal(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(0);
  }
}
