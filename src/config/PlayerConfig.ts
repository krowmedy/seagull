export interface AnimationConfig {
  key: string;
  frameStart: number;
  frameEnd: number;
  frameRate: number;
  repeat: number;
}

export interface SpriteConfig {
  textureKey: string;
  spritesheetPath: string;
  frameWidth: number;
  frameHeight: number;
  animation?: AnimationConfig;
}

export interface StateConfig {
  textureKey: string;
  animationKey?: string;
}

export interface PlayerConfig {
  sprites: SpriteConfig[];
  scale: number;
  gravity: number;
  flapVelocity: number;
  maxFallSpeed: number;
  horizontalSpeed: number;
}

export const PlayerState = {
  Flying: 'flying',
  Walking: 'walking',
} as const;
export type PlayerState = typeof PlayerState[keyof typeof PlayerState];

export const seagullConfig: PlayerConfig = {
  sprites: [
    {
      textureKey: 'seagull',
      spritesheetPath: 'assets/seagull/seagull-flying.png',
      frameWidth: 309,
      frameHeight: 202,
      animation: { key: 'fly', frameStart: 0, frameEnd: 3, frameRate: 8, repeat: -1 },
    },
  ],
  scale: 0.35,
  gravity: 600,
  flapVelocity: 350,
  maxFallSpeed: 500,
  horizontalSpeed: 250,
};

export const seagullStates: Record<PlayerState, StateConfig> = {
  [PlayerState.Flying]: { textureKey: 'seagull', animationKey: 'fly' },
  [PlayerState.Walking]: { textureKey: 'seagull' },
};
