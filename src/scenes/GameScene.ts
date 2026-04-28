import * as Phaser from 'phaser';
import { Seagull } from '../objects/Seagull.ts';
import { Background } from '../objects/Background.ts';
import { Surface } from '../objects/Surface.ts';
import { Platform } from '../objects/Platform.ts';
import { Food } from '../objects/Food.ts';
import { Dog } from '../objects/Dog.ts';
import { Cat } from '../objects/Cat.ts';
import { level1Config } from '../config/LevelConfig.ts';
import { CharacterState } from '../config/CharacterState.ts';
import { BASE_HUD_TEXT_STYLE, spawnScorePopup } from '../ui/Hud.ts';

const ENEMY_STOMP_POINTS = 50;

export class GameScene extends Phaser.Scene {
  private player!: Seagull;
  private background!: Background;
  private surface!: Surface;
  private platforms: Platform[] = [];
  private enemies: Array<Dog | Cat> = [];
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
    Cat.preload(this);
    Surface.preload(this, level1Config.surface);
    Background.preloadTextures(this, level1Config);
    for (const platform of level1Config.platforms) {
      Platform.preload(this, platform);
    }
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
    this.spawnPlatforms();
    this.spawnEnemies();
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
    const { worldWidth } = level1Config;
    const playerStartPosition = { x: worldWidth * 0.04, y: 80 };
    this.player = new Seagull(this, playerStartPosition.x, playerStartPosition.y);
    this.player.createAnimations();
    // Render the seagull above gameplay objects (surface, platforms, enemies, food)
    // so it stays visible when overlapping them. Background uses negative depth.
    this.player.setDepth(1);

    // Only land into Walking from Flying — leave the input-driven Walking ↔ Standing
    // swap in update() alone. Gravity is always on, so this collider fires every frame
    // while resting on the surface; without this guard it would force Walking each tick.
    this.physics.add.collider(this.player, this.surface, () => {
      if (this.player.getCharacterState() === CharacterState.Flying) {
        this.player.setCharacterState(CharacterState.Walking);
      }
    });
  }

  private spawnPlatforms(): void {
    this.platforms = level1Config.platforms.map(p => new Platform(this, p));
    this.physics.add.collider(
      this.player,
      this.platforms,
      () => {
        if (this.player.getCharacterState() === CharacterState.Flying) {
          this.player.setCharacterState(CharacterState.Walking);
        }
      },
      // One-way gate: Phaser fires the collide callback on every overlap regardless
      // of whether the static body's checkCollision flags allow separation. Without
      // this gate, the callback would flip state Flying → Walking each time the
      // seagull rises through a platform from below, giving a phantom flap.
      player => {
        const body = (player as Phaser.Physics.Arcade.Sprite).body as Phaser.Physics.Arcade.Body;
        return body.velocity.y >= 0;
      },
    );
  }

  private spawnEnemies(): void {
    const dogs = level1Config.dogs.map(d => {
      const dog = new Dog(this, d.x, d.y);
      dog.registerAnimations();
      return dog;
    });
    const cats = level1Config.cats.map(c => {
      const cat = new Cat(this, c.x, c.y);
      cat.registerAnimations();
      return cat;
    });
    this.enemies = [...dogs, ...cats];

    this.physics.add.collider(this.enemies, this.surface);
    this.physics.add.overlap(this.player, this.enemies, (_player, enemyObj) => {
      const enemy = enemyObj as Dog | Cat;
      const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
      const enemyBody = enemy.body as Phaser.Physics.Arcade.Body;

      if (!enemyBody.enable) return;

      const isStomp =
        playerBody.velocity.y > 0 && playerBody.bottom <= enemyBody.center.y;

      if (isStomp) {
        this.player.points += ENEMY_STOMP_POINTS;
        this.scoreText.setText(`SCORE : ${this.player.points}`);
        spawnScorePopup(this, enemy.x, enemy.y, ENEMY_STOMP_POINTS);
        this.player.flap();
        this.enemies = this.enemies.filter(e => e !== enemy);
        enemy.die();
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

    // Walked off a platform / surface edge: nothing is supporting the body, so flip
    // back to Flying and let gravity take over.
    const playerBody = this.player.body as Phaser.Physics.Arcade.Body;
    const grounded = playerBody.touching.down || playerBody.blocked.down;
    const groundedState = this.player.getCharacterState();
    if (
      !grounded &&
      (groundedState === CharacterState.Walking || groundedState === CharacterState.Standing)
    ) {
      this.player.setCharacterState(CharacterState.Flying);
    }

    const state = this.player.getCharacterState();
    if (state === CharacterState.Standing && moving) {
      this.player.setCharacterState(CharacterState.Walking);
    } else if (state === CharacterState.Walking && !moving) {
      this.player.setCharacterState(CharacterState.Standing);
    }

    for (const enemy of this.enemies) {
      enemy.update();
    }

    this.player.clampToBounds();
    this.background.update(this.cameras.main.scrollX);
  }
}
