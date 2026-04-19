export interface ParallaxLayer {
  tileKey: string;
  scrollFactor: number;
  depth: number;
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
    { tileKey: 'bg-sky',        scrollFactor: 0.0, depth: -4 },
    { tileKey: 'bg-distant',    scrollFactor: 0.2, depth: -3 },
    { tileKey: 'bg-cityscape',  scrollFactor: 0.5, depth: -2 },
    { tileKey: 'bg-foreground', scrollFactor: 0.8, depth: -1 },
  ],
};
