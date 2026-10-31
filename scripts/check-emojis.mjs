// Falha se encontrar emojis em src/, docs/ ou prompts/. Regra do projeto: nada de emojis.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
const EXT = new Set(['.ts', '.md', '.html', '.json', '.sql', '.css']);
const RE = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F000}-\u{1F2FF}\u{FE0F}]/u;
let bad = 0;
function walk(d) {
  for (const n of readdirSync(d)) {
    if (n === 'node_modules' || n === 'dist' || n === 'prototype' || n.startsWith('.git')) continue;
    const p = join(d, n);
    if (statSync(p).isDirectory()) walk(p);
    else if (EXT.has(extname(n))) readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (RE.test(l)) { console.error(`${p}:${i + 1}: ${l.trim()}`); bad++; } });
  }
}
walk('.');
if (bad) { console.error(`\n${bad} linha(s) com emoji. Remova antes de concluir.`); process.exit(1); }
console.log('OK: nenhum emoji encontrado.');
