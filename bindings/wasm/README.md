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

### Example (browser)

```sh
cd bindings/wasm
wasm-pack build . --target web
```

```js
import init, { render } from './pkg/txm_wasm.js';

await init();
document.body.textContent = render('\\frac{1}{2}');
```

## License
- Apache License, Version 2.0 ([LICENSE-APACHE](../../LICENSE-APACHE))
- MIT license ([LICENSE-MIT](../../LICENSE-MIT))
