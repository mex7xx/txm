import init, { render } from './pkg/txm_wasm.js';

const input = document.getElementById('input');
const output = document.getElementById('output');
const error = document.getElementById('error');

const HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(text) {
  return text.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

function resetStyle(style) {
  style.bold = false;
  style.italic = false;
  style.underline = false;
}

// Apply the subset of SGR codes TXM emits: bold (1), italic (3),
// underline (4), resets (0, 22, 23, 24), and extended colors, which are
// stripped along with their parameters (`38;5;n`, `48;5;n`, `38;2;r;g;b`,
// `48;2;r;g;b`).
function applySgr(style, params) {
  const codes = params === '' ? [0] : params.split(';').map(Number);

  for (let i = 0; i < codes.length; i += 1) {
    switch (codes[i]) {
      case 0:
        resetStyle(style);
        break;
      case 1:
        style.bold = true;
        break;
      case 3:
        style.italic = true;
        break;
      case 4:
        style.underline = true;
        break;
      case 22:
        style.bold = false;
        break;
      case 23:
        style.italic = false;
        break;
      case 24:
        style.underline = false;
        break;
      case 38:
      case 48:
        // Extended color: skip its parameters so the color numbers are not
        // misread as style codes. `38;5;n` has two, `38;2;r;g;b` has four.
        if (codes[i + 1] === 5) {
          i += 2;
        } else if (codes[i + 1] === 2) {
          i += 4;
        }
        break;
      default:
        break;
    }
  }
}

function styledHtml(text, style) {
  const classes = [];
  if (style.bold) classes.push('bold');
  if (style.italic) classes.push('italic');
  if (style.underline) classes.push('underline');

  const escaped = escapeHtml(text);
  return classes.length > 0
    ? `<span class="${classes.join(' ')}">${escaped}</span>`
    : escaped;
}

// Convert TXM's ANSI SGR output to HTML, one styled span per run of text.
function ansiToHtml(ansi) {
  const style = { bold: false, italic: false, underline: false };
  const parts = [];
  const sgr = /\x1b\[([0-9;]*)m/g;
  let lastIndex = 0;
  let match;

  while ((match = sgr.exec(ansi)) !== null) {
    const text = ansi.slice(lastIndex, match.index);
    if (text) parts.push(styledHtml(text, style));
    applySgr(style, match[1]);
    lastIndex = match.index + match[0].length;
  }

  const tail = ansi.slice(lastIndex);
  if (tail) parts.push(styledHtml(tail, style));

  return parts.join('');
}

function draw() {
  error.textContent = '';

  try {
    output.innerHTML = ansiToHtml(render(input.value));
  } catch (err) {
    output.textContent = '';
    error.textContent = err instanceof Error ? err.message : String(err);
  }
}

document.getElementById('render').addEventListener('click', draw);

await init();
draw();
