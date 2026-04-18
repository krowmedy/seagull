# Source Code Guide

Explanation of each TypeScript source file in `src/`. Updated whenever files are added, removed, or their responsibilities change significantly.

---

## `src/main.ts`

Entry point. Creates the `Phaser.Game` instance with the canvas size (960×540), background colour, and the Arcade Physics plugin. World gravity is intentionally set to zero here — each character body carries its own gravity value so physics are self-contained per character. Registers `GameScene` as the only scene.

---

## `src/config/PlayerConfig.ts`

Defines the `PlayerConfig` interface and the concrete `seagullConfig` object.

| Field | Purpose |
|---|---|
| `textureKey` | Key used to look up the sprite texture in the Phaser cache |
| `scale` | Uniform display scale applied to the sprite |
| `gravity` | Downward acceleration (px/s²) applied to this character's physics body |
| `flapVelocity` | Upward speed (px/s) applied instantly on each flap |
| `maxFallSpeed` | Terminal velocity cap so the seagull doesn't accelerate forever |
| `horizontalSpeed` | Speed (px/s) applied while a left/right arrow key is held |

This is the **single file to change** when tuning feel or swapping to a different character. No game logic lives here.

---

## `src/objects/Player.ts`

The `Player` class extends `Phaser.Physics.Arcade.Sprite`. It owns everything about how the player character behaves physically.

**`static preloadTexture(scene, config)`**
Called during a scene's `preload` phase. Until real sprite art exists, it draws a white 48×32 ellipse using `scene.make.graphics()` and bakes it into the Phaser texture cache under `config.textureKey`. Swap this out later by loading a real spritesheet under the same key.

**`constructor(scene, x, y, config)`**
Adds the sprite to the scene's display list and physics world, sets scale, and configures the Arcade body with the per-character gravity and terminal velocity from `config`.

**`flap()`**
Sets the body's Y velocity to `-config.flapVelocity` (upward).

**`setHorizontalVelocity(vx)`**
Sets the body's X velocity directly. Called every frame from `GameScene` — positive for right, negative for left, zero when no key is held (instant stop, no sliding).

**`clampToBounds()`**
Prevents the player leaving the canvas. Checks all four edges each frame and snaps position back if crossed. Velocity is only zeroed if it is directed *into* the boundary — this ensures a flap applied on the same frame the seagull hits the floor is not immediately cancelled.

---

## `src/scenes/GameScene.ts`

The main (and currently only) gameplay scene. Follows the standard Phaser scene lifecycle:

- **`preload`** — generates the placeholder player texture via `Player.preloadTexture`.
- **`create`** — spawns the `Player` at 17% across the canvas, vertically centred. Registers the Space key and cursor keys.
- **`update`** — runs every frame. Checks for a Space `JustDown` event to trigger a flap (edge-triggered, not level-triggered). Reads left/right cursor state to set horizontal velocity, zeroing it when neither key is held. Calls `player.clampToBounds()` last so boundary enforcement always sees the final velocity for the frame.
