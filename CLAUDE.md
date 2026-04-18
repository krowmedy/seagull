# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Node is installed via nvm4w at `C:\nvm4w\nodejs\`. In bash shells, prefix npm commands with the full path or use PowerShell:

```bash
# Dev server (hot reload)
C:\nvm4w\nodejs\npm.cmd run dev       # http://localhost:5173

# Type-check + production build
C:\nvm4w\nodejs\npm.cmd run build

# Preview production build
C:\nvm4w\nodejs\npm.cmd run preview
```

There are no tests or linter configured yet.

## Architecture

**Stack:** Phaser 4 · TypeScript 6 · Vite 8. No test framework.

**Key TypeScript strictness flags** (`tsconfig.json`): `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (type-only imports must use `import type`). All imports to `.ts` files must include the `.ts` extension.

**Phaser import style:** Phaser has no default export in its ESM build — always use `import * as Phaser from 'phaser'`.

### Source layout

```
src/
  main.ts              # Phaser.Game bootstrap — scene list and physics config live here
  config/
    PlayerConfig.ts    # PlayerConfig interface + seagullConfig default
  objects/
    Player.ts          # Player class (extends Phaser.Physics.Arcade.Sprite)
  scenes/
    GameScene.ts       # Main gameplay scene
```

### Player swappability pattern

The `PlayerConfig` interface (`src/config/PlayerConfig.ts`) is the single point of change to swap the player character. It holds `textureKey`, `scale`, `gravity`, `flapVelocity`, and `maxFallSpeed`. The `Player` class and `GameScene` are fully driven by whichever config object is passed in.

To replace the seagull with a different character:
1. Load the new spritesheet in `GameScene.preload()` under a new texture key
2. Create a new config object implementing `PlayerConfig`
3. Pass it where `seagullConfig` is currently used — no other files change

Until real sprite art is added, `Player.preloadTexture()` generates a placeholder white ellipse via `scene.make.graphics().generateTexture()`.

### Physics

World gravity is set to `{ x: 0, y: 0 }` in `main.ts`. Per-body gravity is applied inside the `Player` constructor from `config.gravity`. This keeps each character's physics self-contained.
