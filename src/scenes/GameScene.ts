import * as Phaser from 'phaser';
import { Player } from '../objects/Player.ts';
import { seagullConfig } from '../config/PlayerConfig.ts';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spaceKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    Player.preloadTexture(this, seagullConfig);
  }

  create(): void {
    const { width, height } = this.scale;
    this.player = new Player(this, width * 0.17, height / 2, seagullConfig);
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.flap();
    }
    this.player.clampToBounds();
  }
}
