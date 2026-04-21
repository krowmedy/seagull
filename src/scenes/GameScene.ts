import * as Phaser from 'phaser';
import { Seagull } from '../objects/Seagull.ts';
import { Background } from '../objects/Background.ts';
import { level1Config } from '../config/LevelConfig.ts';
import { CharacterState } from '../config/CharacterState.ts';

export class GameScene extends Phaser.Scene {
  private player!: Seagull;
  private background!: Background;
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private wKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    Seagull.preload(this);
    Background.preloadTextures(this, level1Config);
  }

  create(): void {
    const { worldWidth, worldHeight } = level1Config;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.background = new Background(this, level1Config);

    const playerStartPosition = { x: worldWidth * 0.04, y: worldHeight / 2 };
    this.player = new Seagull(this, playerStartPosition.x, playerStartPosition.y);
    this.player.createAnimations();

    const cameraLerpX = 0.08;
    const cameraLerpY = 0.08;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, cameraLerpX, cameraLerpY);

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.wKey)) {
      const next = this.player.getCharacterState() === CharacterState.Walking
        ? CharacterState.Flying
        : CharacterState.Walking;
      this.player.setCharacterState(next);
    }

    if (this.player.getCharacterState() !== CharacterState.Walking) {
      if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
        this.player.flap();
      }
    }

    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stopHorizontal();
    }

    this.player.clampToBounds();
    this.background.update(this.cameras.main.scrollX);
  }
}
