# Source Code Guide

Explanation of each TypeScript source file in `src/`. Updated whenever files are added, removed, or their responsibilities change significantly.

---

## `src/main.ts`

Entry point. Creates the `Phaser.Game` instance with the canvas size (960×540), background colour, and the Arcade Physics plugin. World gravity is intentionally set to zero here — each character body carries its own gravity value so physics are self-contained per character. Registers `GameScene` as the only scene.

---

## `src/config/CharacterState.ts`

Defines `CharacterState` — a `const` object + companion type naming the states a character can be in (`Flying`, `Walking`). Uses a `const` object rather than a TypeScript `enum` to stay compatible with the `erasableSyntaxOnly` compiler flag. Call sites use `CharacterState.Flying`, `CharacterState.Walking`.

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

Pure TypeScript utility with no Phaser dependency. Exports `clampToBounds(pos, vel, bounds)` which returns a new position and velocity after applying boundary constraints. Velocity is only zeroed when directed *into* a boundary — preserving a flap applied on the same frame the character touches the floor. Used by `Character.clampToBounds()` and covered by unit tests.

---

## `src/objects/Animation.ts`

The `Animation` class models a single animation clip: `key`, `frameStart`, `frameEnd`, `frameRate`, `repeat` (-1 = loop).

**`register(scene, textureKey)`**
Registers the animation with the scene's animation manager, bound to the given texture. Called by `Sprite.registerAnimation`.

---

## `src/objects/Sprite.ts`

The `Sprite` class represents a spritesheet asset and its optional `Animation`. Fields: `textureKey`, `spritesheetPath`, `frameWidth`, `frameHeight`, and an optional `animation`. A `Sprite` with no `animation` is treated as static.

**`load(scene)`**
Loads the spritesheet into the Phaser cache under `textureKey`. Called during the `preload` phase.

**`registerAnimation(scene)`**
Delegates to `animation.register(scene, textureKey)` if an animation is present; no-op otherwise.

---

## `src/objects/Character.ts`

Abstract base class extending `Phaser.Physics.Arcade.Sprite`. Owns the physics body setup, state tracking, animation registration, and boundary clamping that every character shares. Concrete characters (e.g. `Seagull`) extend it and declare their own sprites, state mapping, and character-specific behaviours.

Also exports `PhysicsParams` — a small interface (`gravity`, `maxFallSpeed`, `scale`) passed to the constructor, kept small so the subclass doesn't need a full config object.

**`constructor(scene, x, y, initialSprite, initialState, physics)`**
Calls `super()` with the initial sprite's texture key, registers the instance with the scene and physics world, and configures scale, gravity, and terminal velocity from `physics`.

**`abstract spriteFor(state)`**
Subclasses implement this to map a `CharacterState` to the `Sprite` that should be displayed. Replaces the previous `Record<PlayerState, StateConfig>` data structure with polymorphism.

**`abstract allSprites` (getter)**
Subclasses return every `Sprite` the character uses, so `Character.createAnimations` can register all their animations up front.

**`createAnimations()`**
Iterates `allSprites` calling `registerAnimation` on each, then plays the animation for the initial state. Called from `GameScene.create()` after construction.

**`setCharacterState(state)`**
Swaps the displayed texture and plays (or stops) the animation for the given state. No-op if already in that state.

**`getCharacterState()`**
Returns the current state.

**`clampToBounds()`**
Thin wrapper around `clampToBounds` from `src/utils/clamp.ts`. Reads boundaries from `scene.physics.world.bounds` so it constrains to the full scrollable world, not just the visible canvas.

---

## `src/objects/Seagull.ts`

Concrete `Character` subclass for the seagull. Holds its `Sprite` instances as private static fields (currently `FLYING`, with `WALKING` planned), plus module-level physics constants (`SEAGULL_PHYSICS`, `FLAP_VELOCITY`, `HORIZONTAL_SPEED`).

**`static preload(scene)`**
Loads every sprite this character uses. Called from `GameScene.preload()`.

**`constructor(scene, x, y)`**
Delegates to `Character`'s constructor with `Seagull.FLYING` as the initial sprite and `SEAGULL_PHYSICS` as the physics parameters. No other arguments needed.

**`spriteFor(state)` / `allSprites`**
Implements the abstract members from `Character`. The `switch` in `spriteFor` is the canonical place to wire a new state to a sprite.

**`flap()`**
Applies an upward impulse of `FLAP_VELOCITY`.

**`moveLeft()` / `moveRight()` / `stopHorizontal()`**
Horizontal movement helpers that encapsulate `HORIZONTAL_SPEED` — `GameScene` just expresses intent (which key is held) without knowing the speed value.

---

## `src/objects/Surface.ts`

The `Surface` class is a static physics body (a `Phaser.GameObjects.Rectangle` with a static Arcade body) spanning the bottom of the world. Module-level constants hold its height and placeholder colour.

**`constructor(scene, worldWidth, worldHeight)`**
Creates the rectangle centred along the bottom strip of the world, adds it to the scene's display list, and registers it as a static body so colliders can push dynamic bodies against it.

Collision behaviour (what happens when the seagull lands on it) is wired up in `GameScene` via `this.physics.add.collider(player, surface, callback)` — the scene decides the reaction, not the surface itself.

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

- **`preload`** — loads seagull assets (`Seagull.preload`) and generates placeholder textures for all background layers (`Background.preloadTextures`).
- **`create`** — expands the physics world to the full level dimensions, instantiates the `Background`, `Surface`, and `Seagull`, registers a collider between the seagull and surface (the callback switches the seagull into `Walking` state on contact), then sets the camera to follow the player with a gentle lerp (`0.08`) within the level bounds.
- **`update`** — runs every frame. Handles Space — which switches the seagull from `Walking` back to `Flying` (if needed) and applies a flap — and left/right cursor movement via `moveLeft` / `moveRight` / `stopHorizontal`. Calls `player.clampToBounds()` then `background.update(camera.scrollX)` to drive parallax each frame.

State transitions: landing on the `Surface` triggers `Walking` (via the collider callback); pressing Space triggers `Flying` (plus a flap). No more toggle key.

---

## `src/__tests__/clamp.test.ts`

Unit tests for `src/utils/clamp.ts`. Covers mid-air (no clamp), top/bottom/left/right edge snapping, velocity zeroing on boundary impact, and the critical case that upward velocity (a flap) applied while at the bottom boundary is not cancelled.

## `src/__tests__/levelConfig.test.ts`

Data integrity tests for `level1Config`. Validates that all scroll factors are in `[0, 1]`, all depths are negative, layers are ordered furthest-to-nearest, and all tile keys are unique. Acts as a safety net against accidental misconfiguration.
