import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { render } = require('../pkg/txm_wasm.js');

const out = render('E = mc^2');
assert.ok(out.includes('mc'), `expected mc in output: ${JSON.stringify(out)}`);
assert.ok(out.includes('\x1b['), `expected ANSI styling: ${JSON.stringify(out)}`);

assert.equal(render(''), '', 'empty input should render to an empty string');

assert.throws(
    () => render('\\frac{1'),
    (err) => err instanceof Error && err.message.length > 0,
    'invalid input should throw a JavaScript Error',
);

console.log('wasm smoke test passed');
