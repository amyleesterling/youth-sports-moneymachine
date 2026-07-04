#!/usr/bin/env node
/* Regenerates js/data.js from the canonical data files in data/.
   Run after editing any data file:  node tools/gen-data.js */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const sources = JSON.parse(fs.readFileSync(path.join(root, 'data/sources.json'), 'utf8'));
const sports = JSON.parse(fs.readFileSync(path.join(root, 'data/sports.json'), 'utf8'));
const cpi = JSON.parse(fs.readFileSync(path.join(root, 'data/cpi.json'), 'utf8'));

// number the sources in order for footnotes
const numbered = {};
Object.keys(sources.sources).forEach((id, i) => {
  numbered[id] = Object.assign({ n: i + 1 }, sources.sources[id]);
});

// integrity check: every source id referenced by a data point must exist
const missing = new Set();
for (const s of sports.sports) {
  for (const p of s.series) if (!numbered[p.source]) missing.add(p.source);
  for (const r of s.ranges || []) if (r.source && !numbered[r.source]) missing.add(r.source);
  for (const e of s.events || []) if (e.source && !numbered[e.source]) missing.add(e.source);
}
if (missing.size) {
  console.error('Missing source ids:', [...missing].join(', '));
  process.exit(1);
}

const out = 'window.DATA = ' + JSON.stringify({
  headline: sports.headline,
  combined_base_year: sports.combined_base_year,
  context_series: sports.context_series || [],
  sports: sports.sports,
  cpi: cpi,
  sources: numbered
}, null, 1) + ';\n';

fs.writeFileSync(path.join(root, 'js/data.js'), out);
console.log('Wrote js/data.js —', sports.sports.length, 'sports,', Object.keys(numbered).length, 'sources');
