import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const required = [
  'index.html',
  'app.js',
  'package.json',
  'v4/domain/rules.js',
  'v4/domain/diagnostics.js',
  'v4/state/store.js',
  'v4/engines/profitability-engine.js',
  'v4/engines/landed-cost-engine.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Fichier requis absent: ${file}`);
}

for (const file of required.filter(f => f.endsWith('.js'))) {
  execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
}

const html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('id="dashboard"')) throw new Error('Section dashboard absente.');
if (!html.includes('id="calculer"')) throw new Error('Section calculateur absente.');
if (!html.includes('id="stock"')) throw new Error('Section stock absente.');

console.log('V4 runtime structure and JavaScript syntax: OK');
