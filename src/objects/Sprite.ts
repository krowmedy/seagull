import type * as Phaser from 'phaser';
import type { Animation } from './Animation.ts';

export class Sprite {
  readonly textureKey: string;
  readonly spritesheetPath: string;
  readonly frameWidth: number;
  readonly frameHeight: number;
  readonly animation?: Animation;

  constructor(
    textureKey: string,
    spritesheetPath: string,
    frameWidth: number,
    frameHeight: number,
    animation?: Animation,
  ) {
    this.textureKey = textureKey;
    this.spritesheetPath = spritesheetPath;
    this.frameWidth = frameWidth;
    this.frameHeight = frameHeight;
    this.animation = animation;
  }

  load(scene: Phaser.Scene): void {
    scene.load.spritesheet(this.textureKey, this.spritesheetPath, {
      frameWidth: this.frameWidth,
      frameHeight: this.frameHeight,
    });
  }

  registerAnimation(scene: Phaser.Scene): void {
    this.animation?.register(scene, this.textureKey);
  }
}
