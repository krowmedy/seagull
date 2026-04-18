export interface PlayerConfig {
  textureKey: string;
  scale: number;
  gravity: number;
  flapVelocity: number;
  maxFallSpeed: number;
}

export const seagullConfig: PlayerConfig = {
  textureKey: 'seagull',
  scale: 1,
  gravity: 600,
  flapVelocity: 350,
  maxFallSpeed: 500,
};
