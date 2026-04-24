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

export interface LevelConfig {
  worldWidth: number;
  worldHeight: number;
  surface: SurfaceConfig;
  layers: ParallaxLayer[];
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
};
