import * as Phaser from 'phaser';
import type { PlayerConfig, StateConfig } from '../config/PlayerConfig.ts';
import { clampToBounds as applyClamp } from '../utils/clamp.ts';

export class Player<TState extends string> extends Phaser.Physics.Arcade.Sprite {
  private readonly config: PlayerConfig;
  private readonly states: Record<TState, StateConfig>;
  private currentState: TState;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: PlayerConfig,
    states: Record<TState, StateConfig>,
    initialState: NoInfer<TState>,
  ) {
    super(scene, x, y, states[initialState].textureKey);
    this.config = config;
    this.states = states;
    this.currentState = initialState;

    scene.add.existing(this as unknown as Phaser.GameObjects.GameObject);
    scene.physics.add.existing(this as unknown as Phaser.GameObjects.GameObject);

    this.setScale(config.scale);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(config.gravity);
    body.setMaxVelocityY(config.maxFallSpeed);
  }

  static preloadTextures(scene: Phaser.Scene, config: PlayerConfig): void {
    for (const sprite of config.sprites) {
      scene.load.spritesheet(sprite.textureKey, sprite.spritesheetPath, {
        frameWidth: sprite.frameWidth,
        frameHeight: sprite.frameHeight,
      });
    }
  }

  createAnimations(): void {
    for (const sprite of this.config.sprites) {
      if (sprite.animation) {
        const anim = sprite.animation;
        this.scene.anims.create({
          key: anim.key,
          frames: this.scene.anims.generateFrameNumbers(sprite.textureKey, {
            start: anim.frameStart,
            end: anim.frameEnd,
          }),
          frameRate: anim.frameRate,
          repeat: anim.repeat,
        });
      }
    }

    const initialStateConfig = this.states[this.currentState];
    if (initialStateConfig.animationKey) {
      this.play(initialStateConfig.animationKey);
    }
  }

  transitionTo(state: TState): void {
    if (state === this.currentState) return;
    this.currentState = state;

    const stateConfig = this.states[state];
    this.setTexture(stateConfig.textureKey);
    if (stateConfig.animationKey) {
      this.play(stateConfig.animationKey);
    } else {
      this.stop();
    }
  }

  getState(): TState {
    return this.currentState;
  }

  flap(): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityY(-this.config.flapVelocity);
  }

  setHorizontalVelocity(vx: number): void {
    (this.body as Phaser.Physics.Arcade.Body).setVelocityX(vx);
  }

  clampToBounds(): void {
    const wb = this.scene.physics.world.bounds;
    const body = this.body as Phaser.Physics.Arcade.Body;
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
