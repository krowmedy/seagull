import * as Phaser from 'phaser';

const SURFACE_HEIGHT = 60;
const SURFACE_TEXTURE_KEY = 'surface-breakwater';
const SURFACE_ASSET_PATH = 'assets/surface/wardie_bay_breakwater.png';

export class Surface extends Phaser.GameObjects.TileSprite {
  static preload(scene: Phaser.Scene): void {
    scene.load.image(SURFACE_TEXTURE_KEY, SURFACE_ASSET_PATH);
  }

  constructor(scene: Phaser.Scene, worldWidth: number, worldHeight: number) {
    const x = worldWidth / 2;
    const y = worldHeight - SURFACE_HEIGHT/2;
    super(scene, x, y, worldWidth, SURFACE_HEIGHT, SURFACE_TEXTURE_KEY);

    const source = scene.textures.get(SURFACE_TEXTURE_KEY).getSourceImage();
    const tileScale = SURFACE_HEIGHT / source.height;
    this.setTileScale(tileScale);

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
  }
}
