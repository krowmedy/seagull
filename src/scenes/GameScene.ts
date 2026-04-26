import * as Phaser from 'phaser';
import { Seagull } from '../objects/Seagull.ts';
import { Background } from '../objects/Background.ts';
import { Surface } from '../objects/Surface.ts';
import { Food } from '../objects/Food.ts';
import { Dog } from '../objects/Dog.ts';
import { level1Config } from '../config/LevelConfig.ts';
import { CharacterState } from '../config/CharacterState.ts';
import { BASE_HUD_TEXT_STYLE, spawnScorePopup } from '../ui/Hud.ts';

const DOG_STOMP_POINTS = 50;

export class GameScene extends Phaser.Scene {
  private player!: Seagull;
  private background!: Background;
  private surface!: Surface;
  private dogs: Dog[] = [];
  private spaceKey!: Phaser.Input.Keyboard.Key;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private scoreText!: Phaser.GameObjects.Text;
  private gameOver = false;
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
    // scene.restart() reuses the same instance, so class-field initializers
    // do not re-run — reset persistent state explicitly here.
    this.gameOver = false;
    this.physics.resume();

    this.setupWorld();
    this.spawnPlayer();
    this.spawnDogs();
    this.spawnFoods();
    this.setupCamera();
    this.setupInput();
    this.setupHud();
    this.startMusic();
  }

  private setupWorld(): void {
    const { worldWidth, worldHeight } = level1Config;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.background = new Background(this, level1Config);
    this.surface = new Surface(this, worldWidth, worldHeight, level1Config.surface);
  }

  private spawnPlayer(): void {
    const { worldWidth, worldHeight } = level1Config;
    const playerStartPosition = { x: worldWidth * 0.04, y: worldHeight / 2 };
    this.player = new Seagull(this, playerStartPosition.x, playerStartPosition.y);
    this.player.createAnimations();

    this.physics.add.collider(this.player, this.surface, () => {
      if (this.player.getCharacterState() !== CharacterState.Walking) {
        this.player.setCharacterState(CharacterState.Walking);
      }
    });
  }

  private spawnDogs(): void {
    this.dogs = level1Config.dogs.map(d => {
      const dog = new Dog(this, d.x, d.y);
      dog.registerAnimations();
      return dog;
    });
    this.physics.add.collider(this.dogs, this.surface);
    this.physics.add.overlap(this.player, this.dogs, (_player, dogObj) => {
      const dog = dogObj as Dog;
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      const dogBody = dog.body as Phaser.Physics.Arcade.Body;

      if (!dogBody.enable) return;

      const isStomp =
        playerBody.velocity.y > 0 && playerBody.bottom <= dogBody.center.y;

      if (isStomp) {
        this.player.points += DOG_STOMP_POINTS;
        this.scoreText.setText(`SCORE : ${this.player.points}`);
        spawnScorePopup(this, dog.x, dog.y, DOG_STOMP_POINTS);
        this.player.flap();
        this.dogs = this.dogs.filter(d => d !== dog);
        dog.die();
      } else {
        this.triggerGameOver();
      }
    });
  }

  private triggerGameOver(): void {
    if (this.gameOver) return;
    this.gameOver = true;

    this.sound.stopAll();

    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    playerBody.setVelocity(0, 0);
    playerBody.enable = false;
    this.player.stop();
    this.physics.pause();

    this.tweens.add({
      targets: this.player,
      angle: 360,
      alpha: 0.3,
      duration: 700,
      ease: 'Quad.easeOut',
      onComplete: () => this.showGameOverScreen(),
    });
  }

  private showGameOverScreen(): void {
    const cam = this.cameras.main;
    const cx = cam.width / 2;
    const cy = cam.height / 2;

    this.add
      .text(cx, cy - 20, 'GAME OVER', {
        ...BASE_HUD_TEXT_STYLE,
        fontSize: 64,
        strokeThickness: 6,
        padding: { x: 8, y: 8 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.add
      .text(cx, cy + 40, 'Press any key to restart', {
        ...BASE_HUD_TEXT_STYLE,
        fontSize: 24,
        strokeThickness: 3,
        padding: { x: 6, y: 6 },
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.input.keyboard!.once('keydown', () => {
      this.scene.restart();
    });
  }

  private spawnFoods(): void {
    const foods = level1Config.foods.map(f => new Food(this, f.x, f.y, f.kind));
    this.physics.add.overlap(this.player, foods, (_player, foodObj) => {
      const food = foodObj as Food;
      this.player.points += food.points;
      this.scoreText.setText(`SCORE : ${this.player.points}`);

      if (food.pickupSoundKey) {
        this.sound.play(food.pickupSoundKey, { volume: food.pickupSoundVolume });
      }

      spawnScorePopup(this, food.x, food.y, food.points);

      food.pickup();
    });
  }

  private setupCamera(): void {
    const { worldWidth, worldHeight } = level1Config;
    const cameraLerpX = 0.08;
    const cameraLerpY = 0.08;
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.player, true, cameraLerpX, cameraLerpY);
  }

  private setupInput(): void {
    this.spaceKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  private setupHud(): void {
    this.scoreText = this.add.text(20, 20, `SCORE : ${this.player.points}`, {
      ...BASE_HUD_TEXT_STYLE,
      strokeThickness: 4,
      // Without padding the stroke is clipped by the text's render-target bounds
      // on glyphs whose outline extends past the font's metric box (e.g. "0").
      padding: { x: 6, y: 6 },
      fontSize: 32,
    });
    // Anchor text to camera's viewport
    this.scoreText.setScrollFactor(0);
  }

  private startMusic(): void {
    if (level1Config.backgroundMusic) {
      this.sound.play(level1Config.backgroundMusic.key, {
        loop: true,
        volume: level1Config.backgroundMusic.volume,
      });
    }
  }

  update(): void {
    if (this.gameOver) return;

    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      if (this.player.getCharacterState() !== CharacterState.Flying) {
        this.player.setCharacterState(CharacterState.Flying);
      }
      this.player.flap();
    }

    const moving = this.cursors.left.isDown || this.cursors.right.isDown;
    if (this.cursors.left.isDown) {
      this.player.moveLeft();
    } else if (this.cursors.right.isDown) {
      this.player.moveRight();
    } else {
      this.player.stopHorizontal();
    }

    const state = this.player.getCharacterState();
    if (state === CharacterState.Standing && moving) {
      this.player.setCharacterState(CharacterState.Walking);
    } else if (state === CharacterState.Walking && !moving) {
      this.player.setCharacterState(CharacterState.Standing);
    }

    for (const dog of this.dogs) {
      dog.update();
    }

    this.player.clampToBounds();
    this.background.update(this.cameras.main.scrollX);
  }
}
