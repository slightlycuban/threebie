// Static hosts like gh-pages have no node_modules/, so dist/ carries the
// three.js files under vendor/ instead.
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');

// Every three.js file the page imports (the built-site smoke test fails if
// one is missing), plus the license its MIT terms require us to ship.
const threeFiles = [
  'LICENSE',
  'build/three.module.js',
  'build/three.core.js',
  'examples/jsm/controls/OrbitControls.js',
];

async function copy(from, to = from) {
  await mkdir(dirname(join(dist, to)), { recursive: true });
  await cp(join(root, from), join(dist, to), { recursive: true });
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist);

const page = await readFile(join(root, 'scene.html'), 'utf8');
const rewritten = page.replaceAll('./node_modules/three/', './vendor/three/');
if (rewritten === page) {
  throw new Error("scene.html's import map no longer points at ./node_modules/three/");
}
await writeFile(join(dist, 'index.html'), rewritten);

await copy('src');
await copy('img');
for (const file of threeFiles) {
  await copy(join('node_modules/three', file), join('vendor/three', file));
}

// Otherwise GitHub Pages runs the files through Jekyll.
await writeFile(join(dist, '.nojekyll'), '');

console.log(`built ${dist}`);
