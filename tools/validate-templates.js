// Validate every JSON template's section and block settings against the section schemas, the way Shopify does when
// the GitHub-connected theme syncs. Shopify silently rejects a whole template file if one value is invalid (e.g. a range
// value off its step), and the live store keeps the old version. Theme Check does not catch this.
// Usage (from the theme root): node tools/validate-templates.js   → exit code 1 if anything is wrong
const fs = require('fs');
const path = require('path');
const root = process.argv[2] || '.';
const stripComment = (s) => s.replace(/^\s*\/\*[\s\S]*?\*\//, '');
const schemaOf = (type) => {
  const f = path.join(root, 'sections', `${type}.liquid`);
  if (!fs.existsSync(f)) return null;
  const m = fs.readFileSync(f, 'utf8').match(/{%-?\s*schema\s*-?%}([\s\S]*?){%-?\s*endschema\s*-?%}/);
  return m ? JSON.parse(m[1]) : null;
};
const problems = [];
const check = (where, defs, values) => {
  const byId = Object.fromEntries((defs || []).filter((d) => d.id).map((d) => [d.id, d]));
  for (const [k, v] of Object.entries(values || {})) {
    const d = byId[k];
    if (!d) { problems.push(`${where}: unknown setting "${k}"`); continue; }
    if (d.type === 'select' || d.type === 'radio') {
      if (!d.options.some((o) => o.value === v)) problems.push(`${where}: "${k}" = ${JSON.stringify(v)} not in [${d.options.map((o) => o.value).join(', ')}]`);
    }
    if (d.type === 'range') {
      if (typeof v !== 'number' || v < d.min || v > d.max || Math.abs(((v - d.min) / d.step) - Math.round((v - d.min) / d.step)) > 1e-9)
        problems.push(`${where}: "${k}" = ${v} invalid for range ${d.min}..${d.max} step ${d.step}`);
    }
    if (d.type === 'checkbox' && typeof v !== 'boolean') problems.push(`${where}: "${k}" must be boolean`);
    if ((d.type === 'text' || d.type === 'inline_richtext') && typeof v === 'string' && /<\/?p>/.test(v) && d.type === 'inline_richtext') problems.push(`${where}: "${k}" inline_richtext cannot contain <p>`);
    if (d.type === 'richtext' && typeof v === 'string' && v !== '' && !/^<(p|ul|ol|h[1-6])/.test(v)) problems.push(`${where}: "${k}" richtext must start with a block tag`);
  }
};
for (const f of fs.readdirSync(path.join(root, 'templates')).filter((f) => f.endsWith('.json'))) {
  const t = JSON.parse(stripComment(fs.readFileSync(path.join(root, 'templates', f), 'utf8')));
  for (const id of t.order) {
    const sec = t.sections[id];
    const schema = schemaOf(sec.type);
    if (!schema) { problems.push(`${f} ${id}: unknown section type ${sec.type}`); continue; }
    check(`${f} ${id} (${sec.type})`, schema.settings, sec.settings);
    for (const [bid, b] of Object.entries(sec.blocks || {})) {
      const bdef = (schema.blocks || []).find((x) => x.type === b.type);
      if (!bdef) { problems.push(`${f} ${id}: unknown block type ${b.type}`); continue; }
      check(`${f} ${id}.${bid} (${b.type})`, bdef.settings, b.settings);
    }
    for (const bid of sec.block_order || []) if (!(sec.blocks || {})[bid]) problems.push(`${f} ${id}: block_order has missing block ${bid}`);
  }
}
console.log(problems.length ? problems.join('\n') : 'Templates OK: every setting value matches its section schema.');
process.exitCode = problems.length ? 1 : 0;
