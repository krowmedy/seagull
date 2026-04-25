import * as Phaser from 'phaser';
import { Seagull } from '../objects/Seagull.ts';
import { Background } from '../objects/Background.ts';
import { Surface } from '../objects/Surface.ts';
import { Food } from '../objects/Food.ts';
import { Dog } from '../objects/Dog.ts';
import { level1Config } from '../config/LevelConfig.ts';
import { CharacterState } from '../config/CharacterState.ts';

export class GameScene extends Phaser.Scene {
  private player!: Seagull;
  private background!: Background;
  private surface!: Surface;
  private dogs: Dog[] = [];
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    Seagull.preload(this);
    Dog.preload(this);
    Surface.preload(this, level1Config.surface);
    Background.preloadTextures(this, level1Config);
    for (const placement of level1Config.foods) {
      Food.preload(this, placement.kind);
    }
    if (level1Config.backgroundMusic) {
      this.load.audio(level1Config.backgroundMusic.key, level1Config.backgroundMusic.path);
    }
  }

  create(): void {
    const { worldWidth, worldHeight } = level1Config;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.background = new Background(this, level1Config);

    this.surface = new Surface(this, worldWidth, worldHeight, level1Config.surface);

    const playerStartPosition = { x: worldWidth * 0.04, y: worldHeight / 2 };
    this.player = new Seagull(this, playerStartPosition.x, playerStartPosition.y);
    this.player.createAnimations();

    this.physics.add.collider(this.player, this.surface, () => {
      if (this.player.getCharacterState() !== CharacterState.Walking) {
        this.player.setCharacterState(CharacterState.Walking);
      }
    });

    this.dogs = level1Config.dogs.map(d => {
      const dog = new Dog(this, d.x, d.y);
      dog.registerAnimations();
      return dog;
    });
    this.physics.add.collider(this.dogs, this.surface);
    this.physics.add.overlap(this.player, this.dogs, () => {
      this.sound.stopAll();
      this.scene.restart();
    });

    const foods = level1Config.foods.map(f => new Food(this, f.x, f.y, f.kind));
    this.physics.add.overlap(this.player, foods, (_player, foodObj) => {
      const food = foodObj as Food;
      this.player.points += food.points;
      this.scoreText.setText(`SCORE : ${this.player.points}`);

      if (food.pickupSoundKey) {
        this.sound.play(food.pickupSoundKey, { volume: food.pickupSoundVolume });
      }
      food.destroy();
    });

    const cameraLerpX = 0.08;
    const cameraLerpY = 0.08;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, cameraLerpX, cameraLerpY);

    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard!.createCursorKeys();
    const textConfig = {
      fontFamily: "courier new",
      color: "#fff",
      resolution: 4,
    };
    this.scoreText = this.add.text(20, 20, `SCORE : ${this.player.points}`, {
      ...textConfig,
      fontSize: 32,
    });

    // Anchor text to camera's viewport
    this.scoreText.setScrollFactor(0);

    if (level1Config.backgroundMusic) {
      this.sound.play(level1Config.backgroundMusic.key, {
        loop: true,
        volume: level1Config.backgroundMusic.volume,
      });
    }
  }

  update(): void {
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.getCharacterState() !== CharacterState.Flying) {
        this.player.setCharacterState(CharacterState.Flying);
      }
      this.player.flap();
    }
    console.log(this.cameras.main.x + ":" + this.cameras.main.y);
    this.scoreText.setX(this.cameras.main.x + 20);
    this.scoreText.setY(this.cameras.main.y + 20);
    this.scoreText.update();

    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stopHorizontal();
      if (this.player.getCharacterState() == CharacterState.Walking) {
        this.player.setCharacterState(CharacterState.Standing);
      }
    }

    for (const dog of this.dogs) {
      dog.update();
    }

    this.player.clampToBounds();
    this.background.update(this.cameras.main.scrollX);
  }
}
