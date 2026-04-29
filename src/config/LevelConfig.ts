export interface ParallaxLayer {
  tileKey: string;
  imagePath: string;
  scrollFactor: number;
  depth: number;
  tint?: number;
}

export interface SurfaceConfig {
  tileKey: string;
  imagePath: string;
  height: number;
}

export interface SoundAsset {
  key: string;
  path: string;
  volume?: number;
}

export interface FoodKind {
  textureKey: string;
  imagePath: string;
  scale?: number;
  points: number;
  pickupSound?: SoundAsset;
}

export interface FoodPlacement {
  kind: FoodKind;
  x: number;
  y: number;
}

export interface EnemyPlacement {
  x: number;
  y: number;
}

export interface PlatformConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  textureKey: string;
  imagePath: string;
}

export const BREAD: FoodKind = {
  textureKey: 'food-bread-loaf',
  imagePath: 'assets/food/bread-loaf.png',
  scale: 0.7,
  points: 10,
  pickupSound: { key: 'sfx-ding', path: 'assets/sounds/ding.mp3', volume: 0.01 },
};

export interface LevelConfig {
  worldWidth: number;
  worldHeight: number;
  surface: SurfaceConfig;
  layers: ParallaxLayer[];
  foods: FoodPlacement[];
  dogs: EnemyPlacement[];
  cats: EnemyPlacement[];
  men: EnemyPlacement[];
  platforms: PlatformConfig[];
  backgroundMusic?: SoundAsset;
}

export const level1Config: LevelConfig = {
  worldWidth: 3840,
  worldHeight: 540,
  surface: {
    tileKey: 'surface-breakwater',
    imagePath: 'assets/surface/wardie_bay_breakwater.png',
    height: 60,
  },
  layers: [
    {
      tileKey: 'bg-harbour',
      imagePath: 'assets/background/wardie_bay_breakwater_background.png',
      scrollFactor: 0.3,
      depth: -1,
      tint: 0xaaaaaa,
    },
  ],
  foods: [
    { kind: BREAD, x: 500, y: 463 },
    { kind: BREAD, x: 900, y: 463 },
    { kind: BREAD, x: 1500, y: 320 },
    { kind: BREAD, x: 2200, y: 463 },
    { kind: BREAD, x: 3000, y: 463 },
    { kind: BREAD, x: 3500, y: 220 },
  ],
  dogs: [
    { x: 1200, y: 440 },
    { x: 2600, y: 440 },
  ],
  cats: [
    { x: 3300, y: 440 },
    { x: 3800, y: 440 },
  ],
  men: [
    { x: 1900, y: 380 },
    { x: 3400, y: 380 },
  ],
  platforms: [
    {
      x: 90,
      y: 227,
      width: 122,
      height: 253,
      textureKey: 'platform-graffiti',
      imagePath: 'assets/platform/graffiti_structure.png',
    },
  ],
  backgroundMusic: {
    key: 'level1-music',
    path: 'assets/sounds/level1_background.mp3',
    volume: 0.5,
  },
};
