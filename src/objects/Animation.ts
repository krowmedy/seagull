import type * as Phaser from 'phaser';

export class Animation {
  readonly key: string;
  readonly frameStart: number;
  readonly frameEnd: number;
  readonly frameRate: number;
  readonly repeat: number;

  constructor(
    key: string,
    frameStart: number,
    frameEnd: number,
    frameRate: number,
    repeat: number,
  ) {
    this.key = key;
    this.frameStart = frameStart;
    this.frameEnd = frameEnd;
    this.frameRate = frameRate;
    this.repeat = repeat;
  }

  register(scene: Phaser.Scene, textureKey: string): void {
    scene.anims.create({
      key: this.key,
      frames: scene.anims.generateFrameNumbers(textureKey, {
        start: this.frameStart,
        end: this.frameEnd,
      }),
      frameRate: this.frameRate,
      repeat: this.repeat,
    });
  }
}
