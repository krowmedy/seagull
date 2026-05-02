import * as Phaser from 'phaser';

const PARTICLE_TEXTURE_KEY = 'firework-particle';
const PARTICLE_RADIUS = 3;
const PARTICLE_COLOR = 0xffffff;

const BURST_COUNT = 8;
const BURST_INTERVAL_MS = 350;
const PARTICLES_PER_BURST = 40;
const PARTICLE_LIFESPAN_MS = 3000;
const PARTICLE_GRAVITY_Y = 120;
const PARTICLE_SPEED_MIN = 80;
const PARTICLE_SPEED_MAX = 220;
const PARTICLE_SCALE_START = 1.2;

const BURST_X_MARGIN = 80;
const BURST_Y_MIN = 60;
const BURST_Y_MAX_FRACTION = 0.6;

const FIREWORK_DEPTH = 10;

const COLOR_PALETTE = [
  0xffd23f, // gold
  0xff5e8a, // pink
  0x5edfff, // cyan
  0xffffff, // white
  0xa6ff5e, // lime
  0xff8b3d, // orange
];

export class Fireworks {
  static preload(scene: Phaser.Scene): void {
    if (scene.textures.exists(PARTICLE_TEXTURE_KEY)) return;
    const size = PARTICLE_RADIUS * 2;
    const g = scene.make.graphics();
    g.fillStyle(PARTICLE_COLOR, 1);
    g.fillCircle(PARTICLE_RADIUS, PARTICLE_RADIUS, PARTICLE_RADIUS);
    g.generateTexture(PARTICLE_TEXTURE_KEY, size, size);
    g.destroy();
  }

  static start(scene: Phaser.Scene): void {
    for (let i = 0; i < BURST_COUNT; i++) {
      scene.time.delayedCall(i * BURST_INTERVAL_MS, () => Fireworks.spawnBurst(scene));
    }
  }

  private static spawnBurst(scene: Phaser.Scene): void {
    const cam = scene.cameras.main;
    // Camera-relative spawn so bursts always land on-screen, not in some
    // off-screen world coordinate the player can't see.
    const x = cam.scrollX + Phaser.Math.Between(BURST_X_MARGIN, cam.width - BURST_X_MARGIN);
    const y = cam.scrollY + Phaser.Math.Between(BURST_Y_MIN, cam.height * BURST_Y_MAX_FRACTION);
    const tint = Phaser.Utils.Array.GetRandom(COLOR_PALETTE) as number;

    const emitter = scene.add.particles(x, y, PARTICLE_TEXTURE_KEY, {
      speed: { min: PARTICLE_SPEED_MIN, max: PARTICLE_SPEED_MAX },
      angle: { min: 0, max: 360 },
      scale: { start: PARTICLE_SCALE_START, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: PARTICLE_LIFESPAN_MS,
      gravityY: PARTICLE_GRAVITY_Y,
      tint,
      emitting: false,
    });
    emitter.setDepth(FIREWORK_DEPTH);
    emitter.explode(PARTICLES_PER_BURST);

    scene.time.delayedCall(PARTICLE_LIFESPAN_MS + 100, () => emitter.destroy());
  }
}
