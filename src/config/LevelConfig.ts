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

const BREAD: FoodKind = {
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
  backgroundMusic: {
    key: 'level1-music',
    path: 'assets/sounds/level1_background.mp3',
    volume: 0.5,
  },
};
