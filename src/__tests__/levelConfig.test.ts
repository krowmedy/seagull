import { describe, it, expect } from 'vitest';
import { level1Config } from '../config/LevelConfig.ts';

describe('level1Config', () => {
  it('all scroll factors are in [0, 1]', () => {
    for (const layer of level1Config.layers) {
      expect(layer.scrollFactor).toBeGreaterThanOrEqual(0);
      expect(layer.scrollFactor).toBeLessThanOrEqual(1);
    }
  });

  it('all depth values are negative so layers render behind game objects', () => {
    for (const layer of level1Config.layers) {
      expect(layer.depth).toBeLessThan(0);
    }
  });

  it('layers are ordered from furthest (lowest depth) to nearest (highest depth)', () => {
    const depths = level1Config.layers.map(l => l.depth);
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]).toBeGreaterThan(depths[i - 1]);
    }
  });

  it('all tile keys are unique', () => {
    const keys = level1Config.layers.map(l => l.tileKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
