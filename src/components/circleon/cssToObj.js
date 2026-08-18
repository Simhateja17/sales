// Mirror of cssToObj() in the design export's runtime (support.js).
// Needed where a binding splices whole declarations into a style string,
// e.g. style="...;{{ s.circleStyle }}display:flex;..." — the CSS text cannot
// be parsed until the value is known.
const camel = (s) => {
  const [head, ...rest] = s.split('-');
  return head + rest.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join('');
};

// Split on top-level semicolons only. The original does a plain split(';'),
// which truncates any value containing one — url('data:image/svg+xml;base64,…')
// being the common case.
function splitDecls(css) {
  const out = [];
  let buf = '', depth = 0, quote = null;
  for (const ch of css) {
    if (quote) {
      if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") {
      quote = ch;
    } else if (ch === '(') {
      depth++;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
    } else if (ch === ';' && depth === 0) {
      out.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  out.push(buf);
  return out;
}

export function cssToObj(css) {
  const out = {};
  if (!css) return out;
  for (const decl of splitDecls(String(css))) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    out[prop.startsWith('--') ? prop : camel(prop)] = decl.slice(i + 1).trim();
  }
  return out;
}
