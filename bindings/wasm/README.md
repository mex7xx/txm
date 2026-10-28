<div align="center">
  <h1>TXM.wasm</h1>
  <p>WebAssembly / JavaScript bindings for TXM.</p>
</div>

### Build

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
cd bindings/wasm
wasm-pack build . --target nodejs
```

### Example (Node.js)

```js
const { render } = require('./pkg/txm_wasm.js');

console.log(render('E = mc^2'));
console.log(render('\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}'));
```

`render` returns ANSI-styled Unicode art: the output contains SGR escape
sequences (such as `\x1b[3m...\x1b[0m`), so render it with a terminal or
strip the escapes before displaying it as plain text. If the input cannot be
parsed, `render` throws a JavaScript `Error`.

Run the smoke test after building:

```sh
node tests/smoke.mjs
```

### Demo (browser)

A small no-build demo lives in [`www/`](./www/). Build the web target into a
separate output directory so the Node `pkg/` is left untouched:

```sh
cd bindings/wasm
rustup target add wasm32-unknown-unknown
wasm-pack build . --target web --out-dir www/pkg
python3 -m http.server -d www
```

Open the printed address (for example <http://localhost:8000/>) and enter
LaTeX in the textarea.

> The page must be served over HTTP, not opened as a `file://` URL: browsers
> block ES module imports and WASM fetches from local files.

The integration is just `await init()` followed by `render`. The output is
ANSI SGR text, so the demo converts it to HTML in
[`www/main.js`](./www/main.js); the relevant parts are:

```js
import init, { render } from './pkg/txm_wasm.js';

await init();

const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (text) => text.replace(/[&<>"']/g, (c) => ESCAPES[c]);

function ansiToHtml(ansi) {
  const style = { bold: false, dim: false, italic: false, underline: false };
  const parts = [];
  const sgr = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let match;

  const reset = () => { style.bold = style.dim = style.italic = style.underline = false; };

  const push = (text) => {
    if (!text) return;
    const classes = [];
    if (style.bold) classes.push('bold');
    if (style.dim) classes.push('dim');
    if (style.italic) classes.push('italic');
    if (style.underline) classes.push('underline');
    const escaped = escapeHtml(text);
    parts.push(classes.length ? `<span class="${classes.join(' ')}">${escaped}</span>` : escaped);
  };

  while ((match = sgr.exec(ansi)) !== null) {
    push(ansi.slice(lastIndex, match.index));
    const codes = match[1] === '' ? [0] : match[1].split(';').map(Number);
    for (let i = 0; i < codes.length; i += 1) {
      if (codes[i] === 0) reset();
      else if (codes[i] === 1) style.bold = true;
      else if (codes[i] === 2) style.dim = true;
      else if (codes[i] === 3) style.italic = true;
      else if (codes[i] === 4) style.underline = true;
      else if (codes[i] === 22) style.bold = style.dim = false;
      else if (codes[i] === 23) style.italic = false;
      else if (codes[i] === 24) style.underline = false;
      else if ((codes[i] === 38 || codes[i] === 48) && codes[i + 1] === 5) i += 2;
    }
    lastIndex = match.index + match[0].length;
  }

  push(ansi.slice(lastIndex));
  return parts.join('');
}

document.querySelector('#output').innerHTML = ansiToHtml(render('\\frac{1}{2}'));
```

Style the result with `white-space: pre` so the rendered columns line up.

## License
- Apache License, Version 2.0 ([LICENSE-APACHE](../../LICENSE-APACHE))
- MIT license ([LICENSE-MIT](../../LICENSE-MIT))
