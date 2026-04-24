export interface ParallaxLayer {
  tileKey: string;
  imagePath: string;
  scrollFactor: number;
  depth: number;
  tint?: number;
}

export interface LevelConfig {
  worldWidth: number;
  worldHeight: number;
  layers: ParallaxLayer[];
}

export const level1Config: LevelConfig = {
  worldWidth: 3840,
  worldHeight: 540,
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
