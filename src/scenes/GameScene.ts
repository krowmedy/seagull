import * as Phaser from 'phaser';
import { Player } from '../objects/Player.ts';
import { Background } from '../objects/Background.ts';
import { seagullConfig } from '../config/PlayerConfig.ts';
import { level1Config } from '../config/LevelConfig.ts';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    Player.preloadTexture(this, seagullConfig);
    Background.preloadTexture(this, level1Config);
  }

  create(): void {
    const { worldWidth, worldHeight } = level1Config;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    new Background(this, level1Config);

    this.player = new Player(this, worldWidth * 0.04, worldHeight / 2, seagullConfig);

    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.player.flap();
    }

    const { horizontalSpeed } = seagullConfig;
    if (this.cursors.left.isDown) {
      this.player.setHorizontalVelocity(-horizontalSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setHorizontalVelocity(horizontalSpeed);
    } else {
      this.player.setHorizontalVelocity(0);
    }

    this.player.clampToBounds();
  }
}
