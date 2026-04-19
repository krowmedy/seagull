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

## `src/config/LevelConfig.ts`

Defines the `ParallaxLayer` and `LevelConfig` interfaces, and the concrete `level1Config` object.

| Field | Purpose |
|---|---|
| `worldWidth` | Total scrollable width of the level in pixels |
| `worldHeight` | Height of the level — matches canvas height |
| `layers` | Ordered array of `ParallaxLayer` definitions (furthest to nearest) |

Each `ParallaxLayer` has a `tileKey` (texture cache key), `scrollFactor` (0 = pinned, 1 = player plane), and `depth` (negative values render behind game objects, lower = further back).

Swapping to a real LDtk level means adding a new `LevelConfig` entry and loading the map assets in `GameScene.preload()` — no changes to game logic.

---

## `src/utils/clamp.ts`

Pure TypeScript utility with no Phaser dependency. Exports `clampToBounds(pos, vel, bounds)` which returns a new position and velocity after applying boundary constraints. Velocity is only zeroed when directed *into* a boundary — preserving a flap applied on the same frame the player touches the floor. Used by `Player.clampToBounds()` and covered by unit tests.

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
Thin wrapper around `clampToBounds` from `src/utils/clamp.ts`. Reads boundaries from `scene.physics.world.bounds` (set by `GameScene` from `LevelConfig`) so it constrains to the full scrollable world, not just the visible canvas.

---

## `src/objects/Background.ts`

Generates and renders the multi-layer parallax scrolling background.

**`static preloadTextures(scene, config)`**
Iterates `config.layers` and generates a distinct 128×tile-height placeholder texture for each via `scene.make.graphics()`:
- `bg-sky`: flat dark navy fill
- `bg-distant`: faint low-contrast hill and spire silhouettes
- `bg-cityscape`: Edinburgh tenements with varied rooflines and amber windows
- `bg-foreground`: large dark close-up building faces with bigger windows

**`constructor(scene, config)`**
Creates one `TileSprite` per layer, all pinned to the camera (`scrollFactor 0`), spanning the canvas viewport. Depth is set per layer so they composite in the correct order.

**`update(cameraScrollX)`**
Called every frame from `GameScene`. Advances each tile's `tilePositionX` by `cameraScrollX * layer.scrollFactor` — layers with a low scroll factor move their texture slowly, creating the parallax depth effect.

---

## `src/scenes/GameScene.ts`

The main (and currently only) gameplay scene. Follows the standard Phaser scene lifecycle:

- **`preload`** — generates placeholder textures for the player (`Player.preloadTexture`) and all background layers (`Background.preloadTextures`).
- **`create`** — expands the physics world to the full level dimensions, instantiates the `Background` and `Player`, then sets the camera to follow the player with a gentle lerp (`0.08`) within the level bounds.
- **`update`** — runs every frame. Handles Space flap (edge-triggered) and left/right cursor movement. Calls `player.clampToBounds()` then `background.update(camera.scrollX)` to drive parallax each frame.

---

## `src/__tests__/clamp.test.ts`

Unit tests for `src/utils/clamp.ts`. Covers mid-air (no clamp), top/bottom/left/right edge snapping, velocity zeroing on boundary impact, and the critical case that upward velocity (a flap) applied while at the bottom boundary is not cancelled.

## `src/__tests__/levelConfig.test.ts`

Data integrity tests for `level1Config`. Validates that all scroll factors are in `[0, 1]`, all depths are negative, layers are ordered furthest-to-nearest, and all tile keys are unique. Acts as a safety net against accidental misconfiguration.
