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
  style.dim = false;
  style.italic = false;
  style.underline = false;
}

// Apply the subset of SGR codes TXM emits. Unknown codes (including the
// `38;5;n` / `48;5;n` color parameters) are stripped.
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
      case 2:
        style.dim = true;
        break;
      case 3:
        style.italic = true;
        break;
      case 4:
        style.underline = true;
        break;
      case 22:
        style.bold = false;
        style.dim = false;
        break;
      case 23:
        style.italic = false;
        break;
      case 24:
        style.underline = false;
        break;
      case 38:
      case 48:
        // Extended color: `38;5;n` or `48;5;n`. Skip its arguments.
        if (codes[i + 1] === 5) {
          i += 2;
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
  if (style.dim) classes.push('dim');
  if (style.italic) classes.push('italic');
  if (style.underline) classes.push('underline');

  const escaped = escapeHtml(text);
  return classes.length > 0
    ? `<span class="${classes.join(' ')}">${escaped}</span>`
    : escaped;
}

// Convert TXM's ANSI SGR output to HTML, one styled span per run of text.
function ansiToHtml(ansi) {
  const style = { bold: false, dim: false, italic: false, underline: false };
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
