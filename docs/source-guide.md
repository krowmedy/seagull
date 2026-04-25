# Source Code Guide

Explanation of each TypeScript source file in `src/`. Updated whenever files are added, removed, or their responsibilities change significantly.

---

## `src/main.ts`

Entry point. Creates the `Phaser.Game` instance with the canvas size (960×540), background colour, and the Arcade Physics plugin. World gravity is intentionally set to zero here — each character body carries its own gravity value so physics are self-contained per character. Registers `GameScene` as the only scene.

---

## `src/config/CharacterState.ts`

Defines `CharacterState` — a `const` object + companion type naming the states a character can be in (`Flying`, `Walking`, `Standing`). Uses a `const` object rather than a TypeScript `enum` to stay compatible with the `erasableSyntaxOnly` compiler flag. Call sites use `CharacterState.Flying`, `CharacterState.Walking`, `CharacterState.Standing`.

---

## `src/config/LevelConfig.ts`

Defines the `ParallaxLayer`, `SurfaceConfig`, `FoodKind`, `FoodPlacement`, `EnemyPlacement`, and `LevelConfig` interfaces, and the concrete `level1Config` object.

| Field | Purpose |
|---|---|
| `worldWidth` | Total scrollable width of the level in pixels |
| `worldHeight` | Height of the level — matches canvas height |
| `surface` | `SurfaceConfig` for this level's ground (texture key, image path, height in pixels) |
| `layers` | Ordered array of `ParallaxLayer` definitions (furthest to nearest) |
| `foods` | Array of `FoodPlacement` ({ kind, x, y }) defining food pickups in the level |
| `dogs` | Array of `EnemyPlacement` ({ x, y }) defining where dog enemies spawn |
| `backgroundMusic` | Optional `SoundAsset` for the level's looping soundtrack |

`SoundAsset` is `{ key, path, volume? }` — `volume` is optional (Phaser defaults to 1.0 when omitted) and applied at playback time, so any sound configured through this interface can be tuned without code changes.

`FoodKind` describes a single food type — `textureKey`, `imagePath` (loaded via `scene.load.image` at preload time), optional `scale` (defaults to 1), `points` (score awarded when collected), and an optional `pickupSound: SoundAsset` played by `GameScene` when the seagull collects the food. The `BREAD` kind currently uses `assets/food/bread-loaf.png` and the `assets/sounds/ding.mp3` pickup sound at `volume: 0.5` (dialled down so it doesn't overpower the background music). Adding a new kind = drop the image (and optionally a sound) in `public/assets/`, define a new `FoodKind` constant, and reference it in `level1Config.foods`. Each `FoodPlacement` pairs a `FoodKind` with a world-space position.

Each `ParallaxLayer` has a `tileKey` (texture cache key), `imagePath` (file under `public/` loaded at preload time), `scrollFactor` (0 = pinned, 1 = player plane), `depth` (negative values render behind game objects, lower = further back), and an optional `tint` (hex colour applied multiplicatively — useful for dulling a background so the foreground stands out).

`level1Config` currently has a single layer pointing at `assets/background/wardie_bay_breakwater_background.png`. Adding more parallax layers is a matter of dropping more images into `public/assets/background/` and appending entries to the `layers` array.

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
Swaps the displayed texture, resizes the Arcade body to the new sprite's frame dimensions, and plays (or stops) the animation for the given state. The body's bottom position is preserved across the resize so the character does not visually hop when switching states while resting on a surface. No-op if already in that state.

**`getCharacterState()`**
Returns the current state.

**`clampToBounds()`**
Thin wrapper around `clampToBounds` from `src/utils/clamp.ts`. Reads boundaries from `scene.physics.world.bounds` so it constrains to the full scrollable world, not just the visible canvas.

---

## `src/objects/Seagull.ts`

Concrete `Character` subclass for the seagull. Holds its `Sprite` instances as private static fields (`FLYING`, `WALKING`, `STANDING`), plus module-level physics constants (`SEAGULL_PHYSICS`, `FLAP_VELOCITY`, `HORIZONTAL_SPEED`). The standing sprite is a single-frame animation (`stand`, frames 0–0) so movement can be added later without restructuring. Also exposes a public `points` field (initial value `0`) that `GameScene`'s food-overlap handler increments.

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

## `src/objects/Dog.ts`

A `Dog` is the first enemy character. It extends `Phaser.Physics.Arcade.Sprite` directly (not `Character` — the dog only has one state, so the `CharacterState` machinery would be overkill). The dog walks left at a constant speed, has gravity so it rests on the surface, and triggers a scene restart when the seagull overlaps it.

Module-level constants: `DOG_SCALE` (0.4), `DOG_GRAVITY` (600), `DOG_MAX_FALL_SPEED` (500), `DOG_WALK_SPEED` (80). The walking sprite is loaded from `assets/enemies/dog-walking.png` — 8 frames at 168×180 each, played at 10fps on a loop.

**`static preload(scene)`**
Loads the walking spritesheet. Called from `GameScene.preload()`.

**`constructor(scene, x, y)`**
Creates the sprite, registers it with the scene and physics world, applies scale/gravity/terminal velocity, and sets an initial leftward velocity.

**`registerAnimations()`**
Registers the walk animation with the scene and starts playing it. Called once after construction (must happen after the scene is fully wired).

**`update()`**
Reapplies the leftward velocity each frame so collisions with the surface or terrain don't bring the dog to a halt. Called from `GameScene.update()`.

---

## `src/objects/Food.ts`

The `Food` class is a pickup the seagull collects. Extends `Phaser.Physics.Arcade.Sprite` with a static Arcade body. The displayed texture, scale, and point value all come from the `FoodKind` passed in.

**`static preload(scene, kind)`**
Loads the kind's image into the Phaser cache under `kind.textureKey`, and — if `kind.pickupSound` is defined — loads the audio under that sound's key. Called from `GameScene.preload()` for every kind referenced by the level. Phaser's loader deduplicates by key, so calling it multiple times for the same kind is harmless.

**`constructor(scene, x, y, kind)`**
Creates the sprite at `(x, y)` with `kind.textureKey`, applies `kind.scale` if specified, copies `kind.pickupSound?.key` into `pickupSoundKey` and `kind.pickupSound?.volume` into `pickupSoundVolume`, registers the instance with the scene, and adds a static Arcade body so overlap detection works.

When the seagull overlaps a `Food`, `GameScene` adds the points to `seagull.points`, plays `pickupSoundKey` via `scene.sound.play(key, { volume: pickupSoundVolume })` if set (undefined volume falls back to Phaser's default of 1.0), and calls `food.destroy()`.

## `src/objects/Surface.ts`

The `Surface` class is a static physics body (a `Phaser.GameObjects.TileSprite` with a static Arcade body) spanning the bottom of the world. The texture, image path, and display height all come from a `SurfaceConfig` (defined in `LevelConfig.ts`) so different levels can plug in different ground art without changing this class.

**`static preload(scene, config)`**
Loads the surface image into the Phaser cache under `config.tileKey`. Called from `GameScene.preload()`.

**`constructor(scene, worldWidth, worldHeight, config)`**
Creates the tile sprite sized `worldWidth × config.height`, centred along the bottom strip of the world. Reads the source texture's native height and calls `setTileScale` so the texture is scaled uniformly to fit the target height while preserving aspect ratio — the pattern tiles naturally along X. Adds it to the scene's display list and registers it as a static body so colliders can push dynamic bodies against it.

Collision behaviour (what happens when the seagull lands on it) is wired up in `GameScene` via `this.physics.add.collider(player, surface, callback)` — the scene decides the reaction, not the surface itself.

---

## `src/objects/Background.ts`

Renders the multi-layer parallax scrolling background from images loaded on disk.

**`static preloadTextures(scene, config)`**
Iterates `config.layers` and calls `scene.load.image(tileKey, imagePath)` for each. Despite the name, this is a pure file loader — the class previously generated placeholder textures programmatically, but now relies on real art under `public/assets/background/`.

**`constructor(scene, config)`**
Creates one `TileSprite` per layer, all pinned to the camera (`scrollFactor 0`), spanning the canvas viewport. Each layer's texture is uniformly scaled via `setTileScale` so the source image fills the canvas height while preserving aspect ratio, then tiles horizontally. Depth is set per layer so they composite in the correct order. If the layer specifies a `tint`, it is applied to the sprite.

**`update(cameraScrollX)`**
Called every frame from `GameScene`. Sets each tile's `tilePositionX = (cameraScrollX * scrollFactor) / tileScale` — the division by `tileScale` compensates for the fact that `tilePositionX` is measured in source-texture pixels, so without it the background would scroll faster than intended. Layers with a low scroll factor move their texture slowly, creating the parallax depth effect.

---

## `src/scenes/GameScene.ts`

The main (and currently only) gameplay scene. Follows the standard Phaser scene lifecycle:

- **`preload`** — loads seagull assets (`Seagull.preload`), the surface texture for this level (`Surface.preload(this, level1Config.surface)`), the parallax layer images (`Background.preloadTextures`), one image per food kind referenced in `level1Config.foods` (`Food.preload`), and the level's background music if specified.
- **`create`** — expands the physics world to the full level dimensions, instantiates the `Background`, `Surface`, and `Seagull`, registers a collider between the seagull and surface (the callback switches to `Walking` on contact), spawns one `Food` per entry in `level1Config.foods` and registers an overlap that adds the food's points to `player.points`, plays the food's pickup sound at its configured volume, and destroys the food, sets the camera to follow the player with a gentle lerp (`0.08`) within the level bounds, and starts the level's looping background music (if set) using the music's configured `volume`.
- **`update`** — runs every frame. Computes `onGround` (from `body.touching.down`/`blocked.down`) and key state, then sets the desired character state in priority order: Space-just-pressed → `Flying` + flap; airborne → `Flying`; on-ground with left/right held → `Walking`; on-ground with no movement keys → `Standing`. Then applies horizontal movement, calls `player.clampToBounds()`, and drives parallax via `background.update(camera.scrollX)`.

State transitions are reactive: state is derived each frame from physics contact and key state rather than triggered by events. The `Standing` state requires the seagull to be on-ground *and* no movement keys held — pressing left, right, or space takes it out of `Standing`.

---

## `src/__tests__/clamp.test.ts`

Unit tests for `src/utils/clamp.ts`. Covers mid-air (no clamp), top/bottom/left/right edge snapping, velocity zeroing on boundary impact, and the critical case that upward velocity (a flap) applied while at the bottom boundary is not cancelled.

## `src/__tests__/levelConfig.test.ts`

Data integrity tests for `level1Config`. Validates that all scroll factors are in `[0, 1]`, all depths are negative, layers are ordered furthest-to-nearest, and all tile keys are unique. Acts as a safety net against accidental misconfiguration.
