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
    this.arcadeBody.setSize(Seagull.STANDING.frameHeight, Seagull.STANDING.frameWidth);
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
    const body = this.arcadeBody;
    if (state === CharacterState.Walking || state === CharacterState.Standing) {
      body.setGravityY(0);
      body.setVelocityY(0);
    } else {
      // Make the hitbox smaller for the flying animation because the sprite is much
      // bigger than the walking and standing animations. The larger sprite box
      // would result in more unnatural collisions with enemies.
      this.applySmallerHitbox()
      body.setGravityY(SEAGULL_PHYSICS.gravity);
    }
  }

  flap(): void {
    this.arcadeBody.setVelocityY(-FLAP_VELOCITY);
  }

  moveLeft(): void {
    this.arcadeBody.setVelocityX(-HORIZONTAL_SPEED);
    // The Seagull texture points right. Flip it across the X axis when it's pointing
    // left.
    this.setFlipX(true);
  }

  moveRight(): void {
    this.arcadeBody.setVelocityX(HORIZONTAL_SPEED);
    // Remove the flipX that was set from moveLeft, since the texture points right
    // by default.
    this.setFlipX(false);
  }

  stopHorizontal(): void {
    this.arcadeBody.setVelocityX(0);
  }
}
