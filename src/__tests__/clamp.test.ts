import { describe, it, expect } from 'vitest';
import { clampToBounds } from '../utils/clamp.ts';

const bounds = { x: 0, y: 0, right: 960, bottom: 540 };

describe('clampToBounds', () => {
  it('leaves position and velocity unchanged when mid-air', () => {
    const result = clampToBounds({ x: 160, y: 270 }, { x: 0, y: 100 }, bounds);
    expect(result.pos).toEqual({ x: 160, y: 270 });
    expect(result.vel).toEqual({ x: 0, y: 100 });
  });

  it('snaps to top and zeroes upward velocity', () => {
    const result = clampToBounds({ x: 160, y: -5 }, { x: 0, y: -200 }, bounds);
    expect(result.pos.y).toBe(0);
    expect(result.vel.y).toBe(0);
  });

  it('snaps to top but preserves downward velocity', () => {
    const result = clampToBounds({ x: 160, y: -5 }, { x: 0, y: 50 }, bounds);
    expect(result.pos.y).toBe(0);
    expect(result.vel.y).toBe(50);
  });

  it('snaps to bottom and zeroes downward velocity', () => {
    const result = clampToBounds({ x: 160, y: 545 }, { x: 0, y: 300 }, bounds);
    expect(result.pos.y).toBe(540);
    expect(result.vel.y).toBe(0);
  });

  it('preserves upward velocity when at bottom — flap must not be cancelled', () => {
    const result = clampToBounds({ x: 160, y: 540 }, { x: 0, y: -350 }, bounds);
    expect(result.pos.y).toBe(540);
    expect(result.vel.y).toBe(-350);
  });

  it('snaps to right edge and zeroes rightward velocity', () => {
    const result = clampToBounds({ x: 970, y: 270 }, { x: 250, y: 0 }, bounds);
    expect(result.pos.x).toBe(960);
    expect(result.vel.x).toBe(0);
  });

  it('snaps to left edge and zeroes leftward velocity', () => {
    const result = clampToBounds({ x: -10, y: 270 }, { x: -250, y: 0 }, bounds);
    expect(result.pos.x).toBe(0);
    expect(result.vel.x).toBe(0);
  });

  it('preserves leftward velocity when at right edge', () => {
    const result = clampToBounds({ x: 965, y: 270 }, { x: -250, y: 0 }, bounds);
    expect(result.pos.x).toBe(960);
    expect(result.vel.x).toBe(-250);
  });
});
