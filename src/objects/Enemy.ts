import type { FoodKind } from '../config/LevelConfig.ts';

// Result of a stomp on an enemy. Each enemy decides what its own stomp does
// and returns one of these; GameScene applies the orthogonal effects without
// needing to know which kind of enemy it was.
export interface StompOutcome {
  // True when this stomp killed the enemy and the scene should remove +
  // die() it.
  killed: boolean;
  // Points awarded for this stomp. 0 means no scoring/popup.
  points: number;
  // Food kind to drop at the enemy's position, or undefined for no drop.
  drop?: FoodKind;
}
