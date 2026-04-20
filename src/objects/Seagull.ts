import * as Phaser from 'phaser';
import { Character, type PhysicsParams } from './Character.ts';
import { Sprite } from './Sprite.ts';
import { Animation } from './Animation.ts';
import { CharacterState } from '../config/CharacterState.ts';

const SEAGULL_PHYSICS: PhysicsParams = {
  gravity: 600,
  maxFallSpeed: 500,
  scale: 0.35,
};

const FLAP_VELOCITY = 350;
const HORIZONTAL_SPEED = 250;

export class Seagull extends Character {
  private static readonly FLYING = new Sprite(
    'seagull-flying',
    'assets/seagull/seagull-flying.png',
    309,
    202,
    new Animation('fly', 0, 3, 8, -1),
  );

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, Seagull.FLYING, CharacterState.Flying, SEAGULL_PHYSICS);
  }

  protected spriteFor(state: CharacterState): Sprite {
    switch (state) {
      case CharacterState.Flying:
        return Seagull.FLYING;
      case CharacterState.Walking:
        return Seagull.FLYING;
    }
  }

  protected get allSprites(): readonly Sprite[] {
    return [Seagull.FLYING];
  }

  static preload(scene: Phaser.Scene): void {
    Seagull.FLYING.load(scene);
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
