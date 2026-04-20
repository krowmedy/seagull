export interface StateConfig {
  textureKey: string;
  animationKey?: string;
}

export const PlayerState = {
  Flying: 'flying',
  Walking: 'walking',
} as const;

export type PlayerState = typeof PlayerState[keyof typeof PlayerState];
