// Wipes ../krowmedy.github.io/seagull/ and copies the latest dist/ into it.
// Intended to run after a production build — `npm run deploy` chains both steps.
// The wipe is what makes redeploys clean: old hashed bundles in assets/ would
// otherwise pile up forever since their filenames change every build.
import { rm, mkdir, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const target = resolve(root, '../krowmedy.github.io/seagull');

if (!existsSync(dist)) {
  console.error(`No dist/ found at ${dist} — run the build before deploying.`);
  process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(dist, target, { recursive: true });

console.log(`Deployed to ${target}`);
