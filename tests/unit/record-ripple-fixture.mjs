// Re-record the heights ripple.test.mjs expects (`npm run test:unit:update`).
// Run it only after an intended change to the simulation, and commit the
// result with that change.
import { writeFileSync } from 'node:fs';
import { scenarios, run } from './ripple-scenarios.mjs';

// One scenario per line, so a diff shows which scenarios changed.
const lines = scenarios.map((sc) => `  ${JSON.stringify(sc.name)}: ${JSON.stringify(run(sc))}`);
writeFileSync(new URL('./ripple.fixture.json', import.meta.url), `{\n${lines.join(',\n')}\n}\n`);
console.log(`recorded ${scenarios.length} scenarios`);
