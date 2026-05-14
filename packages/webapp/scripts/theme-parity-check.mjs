#!/usr/bin/env node
// packages/webapp/scripts/theme-parity-check.mjs
//
// Parity audit for theme tokens. Parses _light-tokens.scss and _dark-tokens.scss,
// extracts every `--color-*` declaration name, and fails if any name exists
// in one mode but not the other.
//
// Usage: pnpm theme:check

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const LIGHT_PATH = resolve(ROOT, 'src/style/theme/_light-tokens.scss');
const DARK_PATH = resolve(ROOT, 'src/style/theme/_dark-tokens.scss');

// Match `--color-foo:` and `--color-foo :` declarations. Ignore comments / vars in values.
const TOKEN_RE = /^\s*(--color-[a-z0-9-]+)\s*:/im;

async function extractTokens(path) {
  const content = await readFile(path, 'utf8');
  const seen = new Set();
  for (const line of content.split('\n')) {
    if (line.trimStart().startsWith('//')) continue;
    const m = line.match(TOKEN_RE);
    if (m) seen.add(m[1]);
  }
  return seen;
}

function diff(a, b) {
  return [...a].filter((x) => !b.has(x)).sort();
}

const light = await extractTokens(LIGHT_PATH);
const dark = await extractTokens(DARK_PATH);

const onlyLight = diff(light, dark);
const onlyDark = diff(dark, light);

let exitCode = 0;

if (onlyLight.length) {
  exitCode = 1;
  console.error(`\n❌ ${onlyLight.length} token(s) defined in LIGHT only:`);
  for (const t of onlyLight) console.error(`   ${t}`);
}

if (onlyDark.length) {
  exitCode = 1;
  console.error(`\n❌ ${onlyDark.length} token(s) defined in DARK only:`);
  for (const t of onlyDark) console.error(`   ${t}`);
}

if (exitCode === 0) {
  console.log(`✅ theme parity: ${light.size} tokens, both modes aligned`);
} else {
  console.error(
    `\nFix: add the missing token(s) to the mode where they're absent, or remove from the mode they shouldn't be in.`,
  );
}

process.exit(exitCode);
