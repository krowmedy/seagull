import * as Phaser from 'phaser';
import type { Sprite } from './Sprite.ts';
import type { CharacterState } from '../config/CharacterState.ts';
import { clampToBounds as applyClamp } from '../utils/clamp.ts';

export interface PhysicsParams {
  gravity: number;
  maxFallSpeed: number;
  scale: number;
}

export abstract class Character extends Phaser.Physics.Arcade.Sprite {
  private currentState: CharacterState;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    initialSprite: Sprite,
    initialState: CharacterState,
    physics: PhysicsParams,
  ) {
    super(scene, x, y, initialSprite.textureKey);
    this.currentState = initialState;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(physics.scale);

    this.arcadeBody.setGravityY(physics.gravity);
    this.arcadeBody.setMaxVelocityY(physics.maxFallSpeed);
  }

  protected get arcadeBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  protected abstract spriteFor(state: CharacterState): Sprite;
  protected abstract get allSprites(): readonly Sprite[];

  createAnimations(): void {
    for (const sprite of this.allSprites) {
      sprite.registerAnimation(this.scene);
    }
    const initial = this.spriteFor(this.currentState);
    if (initial.animation) {
      this.play(initial.animation.key);
    }
  }

  setCharacterState(state: CharacterState): void {
    if (state === this.currentState) return;
    this.currentState = state;

    const sprite = this.spriteFor(state);
    const body = this.arcadeBody;
    const prevBottom = body.bottom;

    this.setTexture(sprite.textureKey);
    body.setSize(sprite.frameWidth, sprite.frameHeight, true);
    this.y += prevBottom - body.bottom;

    if (sprite.animation) {
      this.play(sprite.animation.key);
    } else {
      this.stop();
    }
  }

  getCharacterState(): CharacterState {
    return this.currentState;
  }

  clampToBounds(): void {
    const wb = this.scene.physics.world.bounds;
    const body = this.arcadeBody;
    const { pos, vel } = applyClamp(
      { x: this.x, y: this.y },
      { x: body.velocity.x, y: body.velocity.y },
      { x: wb.x, y: wb.y, right: wb.right, bottom: wb.bottom },
    );
    this.x = pos.x;
    this.y = pos.y;
    body.setVelocityX(vel.x);
    body.setVelocityY(vel.y);
  }
}
