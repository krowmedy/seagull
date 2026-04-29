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
| `cats` | Array of `EnemyPlacement` ({ x, y }) defining where cat enemies spawn |
| `men` | Array of `EnemyPlacement` ({ x, y }) defining where man enemies spawn |
| `platforms` | Array of `PlatformConfig` ({ x, y, width, height, textureKey, imagePath }) defining static platforms above the surface |
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

**`applyWalkingHitbox()` (private)**
Resizes the Arcade body to the walking-sprite frame dimensions. Called from the constructor and from the `setCharacterState` override so the collision box stays the same in every state — the flying sprite has fully extended wings, which would otherwise inflate the hitbox far beyond the visible silhouette and cause spurious collisions with enemies.

**`flap()`**
Applies an upward impulse of `FLAP_VELOCITY`.

**`moveLeft()` / `moveRight()` / `stopHorizontal()`**
Horizontal movement helpers that encapsulate `HORIZONTAL_SPEED` — `GameScene` just expresses intent (which key is held) without knowing the speed value. `moveLeft` / `moveRight` also call `setFlipX` to mirror the sprite so it faces the direction of travel; `stopHorizontal` leaves the flip alone so the seagull keeps facing the last direction it moved.

---

## `src/objects/Enemy.ts`

Types-only module exporting the `StompOutcome` interface — the contract every enemy returns from its `stomp()` method. Three orthogonal fields:

- `killed: boolean` — when `true`, `GameScene` removes the enemy from its tracked list and calls `enemy.die()`.
- `points: number` — points awarded for this stomp; `0` means no scoring or popup.
- `drop?: FoodKind` — when set, `GameScene` spawns a `Food` of that kind at the enemy's position and registers a single-target overlap for it.

Each enemy class (`Dog`, `Cat`, `Man`) implements `stomp()` and returns one of these. `GameScene` is then a single generic flow over the outcome — no `instanceof` branches — so adding a new enemy variant is purely a matter of giving it its own `stomp()` implementation.

---

## `src/objects/Dog.ts`

A `Dog` is the first enemy character. It extends `Phaser.Physics.Arcade.Sprite` directly (not `Character` — the dog only has one state, so the `CharacterState` machinery would be overkill). The dog walks left at a constant speed, has gravity so it rests on the surface, and is dangerous to the seagull on contact: a head-on or below collision restarts the scene, but if the seagull lands on it from above (a "stomp") the dog dies via `die()`.

Module-level constants: `DOG_SCALE` (0.4), `DOG_GRAVITY` (600), `DOG_MAX_FALL_SPEED` (500), `DOG_WALK_SPEED` (80), `DOG_STOMP_POINTS` (50). The walking sprite is loaded from `assets/enemies/dog-walking.png` — 8 frames at 168×180 each, played at 10fps on a loop.

**`stomp()`**
Returns `{ killed: true, points: DOG_STOMP_POINTS }` — the dog always dies in one hit and awards 50 points, no drop.

**`static preload(scene)`**
Loads the walking spritesheet. Called from `GameScene.preload()`.

**`constructor(scene, x, y)`**
Creates the sprite, registers it with the scene and physics world, applies scale/gravity/terminal velocity, and sets an initial leftward velocity.

**`registerAnimations()`**
Registers the walk animation with the scene and starts playing it. Called once after construction (must happen after the scene is fully wired).

**`die()`**
Called by `GameScene` when the seagull stomps the dog from above. Disables the arcade body so the overlap callback won't fire again, stops the walk animation, kills any active tweens, and runs a 180ms scale-up (×1.6) + fade-to-zero tween that destroys the sprite on completion. Mirrors `Food.pickup()`.

**`update()`**
Reapplies the leftward velocity each frame so collisions with the surface or terrain don't bring the dog to a halt. Called from `GameScene.update()`.

---

## `src/objects/Cat.ts`

A `Cat` is the second enemy character. Same shape as `Dog` — extends `Phaser.Physics.Arcade.Sprite` directly, walks left at a constant speed, has gravity, and dies when stomped from above. Module-level constants mirror the dog (`CAT_SCALE` 0.4, `CAT_GRAVITY` 600, `CAT_MAX_FALL_SPEED` 500, `CAT_WALK_SPEED` 80, `CAT_STOMP_POINTS` 50). The walking sprite is loaded from `assets/enemies/cat-walking.png` — 8 frames at 136×121 each, played at 10fps on a loop.

API matches `Dog` exactly: `static preload(scene)`, `constructor(scene, x, y)`, `registerAnimations()`, `stomp()` returning `{ killed: true, points: CAT_STOMP_POINTS }`, `die()`, and an empty `update()`. `GameScene` treats dogs, cats, and men uniformly through a single `enemies: Array<Dog | Cat | Man>` field, calling `enemy.stomp()` polymorphically rather than branching on the concrete class.

---

## `src/objects/Man.ts`

A `Man` is the third enemy character. Same shape as `Dog` and `Cat` — extends `Phaser.Physics.Arcade.Sprite` directly, walks left at a constant speed, has gravity. Module-level constants: `MAN_SCALE` (0.7), `MAN_GRAVITY` (600), `MAN_MAX_FALL_SPEED` (500), `MAN_WALK_SPEED` (80), `MAN_HITS_TO_KILL` (2), `MAN_HIT_FLASH_MS` (150), `MAN_STOMP_POINTS` (50). The walking sprite is loaded from `assets/enemies/man-walking.png` — 4 frames at 139×222 each, played at 10fps on a loop.

The Man encapsulates a two-hit kill mechanic and its own drop choice via `stomp()`:

- First stomp: increments `hitsTaken`, calls `playHitEffect()` (a brief red multiplicative tint via `setTint(0xff5555)` cleared after `MAN_HIT_FLASH_MS` by `scene.time.delayedCall`, guarded with `this.active` so a death tween mid-delay can't crash it), and returns `{ killed: false, points: 0 }` — `GameScene` bounces the seagull but skips scoring and removal.
- Second stomp: returns `{ killed: true, points: MAN_STOMP_POINTS, drop: BREAD }` — `GameScene` awards 50 points, drops a piece of bread at the man's position, and runs the death tween.

Because the Man owns the choice of what he drops, `BREAD` is imported here from `LevelConfig` rather than referenced in `GameScene`. Adding a tougher enemy variant is purely a matter of returning a different `StompOutcome` from its own `stomp()` — no `GameScene` changes required.

---

## `src/objects/Food.ts`

The `Food` class is a pickup the seagull collects. Extends `Phaser.Physics.Arcade.Sprite` with a static Arcade body. The displayed texture, scale, and point value all come from the `FoodKind` passed in.

**`static preload(scene, kind)`**
Loads the kind's image into the Phaser cache under `kind.textureKey`, and — if `kind.pickupSound` is defined — loads the audio under that sound's key. Called from `GameScene.preload()` for every kind referenced by the level. Phaser's loader deduplicates by key, so calling it multiple times for the same kind is harmless.

**`constructor(scene, x, y, kind)`**
Creates the sprite at `(x, y)` with `kind.textureKey`, applies `kind.scale` if specified, copies `kind.pickupSound?.key` into `pickupSoundKey` and `kind.pickupSound?.volume` into `pickupSoundVolume`, registers the instance with the scene, and adds a static Arcade body so overlap detection works. A looping yoyo tween bobs the sprite ±6px vertically (800ms, `Sine.easeInOut`) to make pickups visually pop; the static body stays at the original `y`, so the small visual offset doesn't affect overlap detection.

**`pickup()`**
Called by `GameScene` when the seagull overlaps this food. Disables the static body so the overlap callback won't fire again during the animation, kills the bob tween, then runs a 180ms scale-up (×1.6) + fade-to-zero tween that destroys the sprite on completion.

When the seagull overlaps a `Food`, `GameScene` adds the points to `seagull.points`, plays `pickupSoundKey` if set, calls `spawnScorePopup` (from `src/ui/Hud.ts`) to show a `+N` floating text at the food's position, then calls `food.pickup()` to play the absorb animation.

---

## `src/ui/Hud.ts`

Home for shared on-screen text styling and HUD helpers. Exports:

- `BASE_HUD_TEXT_STYLE` — the font/colour/stroke/resolution shared between the persistent score text and the floating `+N` popup. Per-text overrides (`strokeThickness`, `padding`, `fontSize`) are spread on top at the call site.
- `spawnScorePopup(scene, x, y, points)` — adds a `+${points}` text at `(x, y)` and tweens it up 40px while fading to transparent over 600ms (`Quad.easeOut`), destroying the text on completion.

Centralising the base style here stops the score HUD and popup from drifting apart visually as either is tweaked.

## `src/objects/Surface.ts`

The `Surface` class is a static physics body (a `Phaser.GameObjects.TileSprite` with a static Arcade body) spanning the bottom of the world. The texture, image path, and display height all come from a `SurfaceConfig` (defined in `LevelConfig.ts`) so different levels can plug in different ground art without changing this class.

**`static preload(scene, config)`**
Loads the surface image into the Phaser cache under `config.tileKey`. Called from `GameScene.preload()`.

**`constructor(scene, worldWidth, worldHeight, config)`**
Creates the tile sprite sized `worldWidth × config.height`, centred along the bottom strip of the world. Reads the source texture's native height and calls `setTileScale` so the texture is scaled uniformly to fit the target height while preserving aspect ratio — the pattern tiles naturally along X. Adds it to the scene's display list and registers it as a static body so colliders can push dynamic bodies against it.

Collision behaviour (what happens when the seagull lands on it) is wired up in `GameScene` via `this.physics.add.collider(player, surface, callback)` — the scene decides the reaction, not the surface itself.

---

## `src/objects/Platform.ts`

A `Platform` is a static structure above the surface that the seagull can land on top of. Extends `Phaser.GameObjects.Image` with a static Arcade body — the texture comes from `PlatformConfig.textureKey` (loaded from `imagePath`), and the rendered size is forced to `config.width × config.height` via `setDisplaySize`. Configured one-way: only the top face blocks (`checkCollision.up = true`); `down`, `left`, and `right` are disabled so the seagull can flap upward through a platform from below or pass through its sides without snagging.

**`static preload(scene, config)`**
Loads the platform's image into the Phaser cache under `config.textureKey`. Called from `GameScene.preload()` once per platform in the level config. Mirrors `Surface.preload`.

**`constructor(scene, config)`**
Treats `config.x` / `config.y` as the platform's top-left corner (more natural for level design than Phaser's centre-origin default), converts them to a centre point internally, sets the display size from `config.width / config.height`, then registers with the scene and physics world as a static body. Because a `StaticBody` is sized from the source texture at creation time and does not track later display-size changes, the body is explicitly resized via `setSize` + `updateFromGameObject` so the hitbox matches the rendered sprite. Finally disables the three non-top collision faces.

Wiring up player landing behaviour (state transition to `Walking`) is `GameScene`'s job — the platform itself just exposes a static body for colliders to use, mirroring `Surface`.

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

- **`preload`** — loads seagull assets (`Seagull.preload`), dog, cat and man enemy spritesheets (`Dog.preload`, `Cat.preload`, `Man.preload`), the surface texture for this level (`Surface.preload(this, level1Config.surface)`), the parallax layer images (`Background.preloadTextures`), one image per platform in `level1Config.platforms` (`Platform.preload`), one image per food kind referenced in `level1Config.foods` (`Food.preload`), and the level's background music if specified.
- **`create`** — expands the physics world to the full level dimensions, instantiates the `Background`, `Surface`, and `Seagull` (the seagull is set to `depth 1` so it renders above the surface, platforms, enemies, and food, all of which stay at the default depth 0; the background uses negative depths and stays behind), registers a collider between the seagull and surface (the callback switches to `Walking` on contact), spawns platforms via `spawnPlatforms()` — one `Platform` per entry in `level1Config.platforms`, registered as a single collider against the player whose callback also transitions the seagull to `Walking` (so landing on a platform behaves identically to landing on the ground), spawns enemies via `spawnEnemies()` — one `Dog` per entry in `level1Config.dogs`, one `Cat` per entry in `level1Config.cats`, and one `Man` per entry in `level1Config.men`, all stored in a single `enemies: Array<Dog | Cat | Man>` field — and registers a seagull-vs-enemy overlap that branches on impact direction (a stomp from above — descending velocity and the seagull's bottom at/above the enemy's centre — calls `enemy.stomp()` to obtain a `StompOutcome` and applies it generically: `flap()` always, `points > 0` adds to the score and spawns a popup, `drop` spawns a `Food` at the enemy's position via `dropFood`, and `killed: true` removes the enemy from `this.enemies` and calls `enemy.die()` — no `instanceof` branches on enemy type; which spawns a `Food` and registers a single-target overlap whose callback delegates to `collectFood`; any other contact triggers the game-over flow via `triggerGameOver()`), spawns one `Food` per entry in `level1Config.foods` and registers an overlap whose callback also delegates to `collectFood` — a private helper that adds the food's points to `player.points`, plays the food's pickup sound at its configured volume, spawns a `+N` popup, and runs `food.pickup()` to fade and destroy the sprite — sets the camera to follow the player with a gentle lerp (`0.08`) within the level bounds, and starts the level's looping background music (if set) using the music's configured `volume`.

The scene also tracks a `gameOver` flag, set by `triggerGameOver()`. While the flag is set, `update()` short-circuits so player input and dog ticks are ignored. Because `scene.restart()` reuses the same scene instance (class-field initializers do not re-run), `create()` explicitly resets `gameOver = false` and calls `physics.resume()` at the top — without this, the flag and the paused physics from the previous run would carry over and immediately freeze the new game.

**`triggerGameOver()` (private)**
Stops all sounds, freezes the player's arcade body, pauses physics, and runs a 700ms spin-and-fade tween on the seagull (`angle 0 → 360`, `alpha → 0.3`). On tween completion calls `showGameOverScreen()`. Idempotent — re-entry while already in game-over state is a no-op, so simultaneous overlaps with multiple dogs don't double-fire.

**`showGameOverScreen()` (private)**
Adds two camera-locked (`scrollFactor 0`) text objects centred on the viewport: a large "GAME OVER" title and a smaller "Press any key to restart" prompt, both styled from `BASE_HUD_TEXT_STYLE`. Registers a one-shot `keydown` listener via `input.keyboard.once` that restarts the scene.
- **`update`** — runs every frame. Space- or Up-just-pressed → `Flying` + flap. Then applies horizontal movement based on left/right keys. Then a fall-off check: if the seagull is in `Walking` or `Standing` and neither `body.touching.down` nor `body.blocked.down` is set (nothing is supporting it from below), it transitions back to `Flying` so gravity pulls it down — this is what makes walking off a platform edge actually fall. Finally swaps between `Standing` and `Walking` symmetrically based on whether a movement key is held, calls `player.clampToBounds()`, and drives parallax via `background.update(camera.scrollX)`.

Gravity is on in every seagull state. Resting on a surface or platform works because the body keeps trying to fall a tiny bit each step and the collider zeroes the velocity on contact — that constant downward intent is exactly what lets `touching.down` reset the moment the body steps off an edge, which is the signal the fall-off check above relies on. Because the surface and platform colliders consequently fire every frame while resting, their callbacks only transition `Flying → Walking` (never `Standing → Walking`); the input-driven `Walking ↔ Standing` swap in `update` is left untouched.

---

## `src/__tests__/clamp.test.ts`

Unit tests for `src/utils/clamp.ts`. Covers mid-air (no clamp), top/bottom/left/right edge snapping, velocity zeroing on boundary impact, and the critical case that upward velocity (a flap) applied while at the bottom boundary is not cancelled.

## `src/__tests__/levelConfig.test.ts`

Data integrity tests for `level1Config`. Validates that all scroll factors are in `[0, 1]`, all depths are negative, layers are ordered furthest-to-nearest, and all tile keys are unique. Acts as a safety net against accidental misconfiguration.
