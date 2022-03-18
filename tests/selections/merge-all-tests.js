#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const targetFile = path.resolve(__dirname, '../../../test/unit/selections.js');
const head = [
  "'use strict';",
  '',
  'import {',
  '  mergeSelections,',
  '  normalizeSelection,',
  '  getIntersection,',
  '  getSelectionFromString,',
  '  removeFromSelections,',
  '  removePartOfRowsSelection,',
  '  removeFromSelections,',
  '  removePartOfColumnsSelection,',
  "} from '../../lib/selections/util.js';",
  '',
  'export default function () {',
  '  const { deepStrictEqual } = chai.assert;',
].join('\n');

const tail = ['}', ''].join('\n');

const code = [head];

const files = fs
  .readdirSync(__dirname)
  .filter((it) => it.startsWith('test-') && it.endsWith('.js'));
for (const file of files) {
  const lines = fs
    .readFileSync(path.resolve(__dirname, file), 'utf8')
    .split('\n');
  let ok = false;
  for (const line of lines) {
    if (!ok && line.startsWith('it(')) ok = true;
    if (ok) {
      code.push(line ? ('  ' + line) : line);
      continue;
    }
  }
}

code.push(tail);
fs.writeFileSync(targetFile, code.join('\n'));
console.log(`created '${targetFile}'`);

const eslint = path.resolve(__dirname, '../../../node_modules/.bin/eslint');
if (fs.existsSync(eslint)) {
  spawnSync(eslint, ['--no-ignore', '--fix', '--', targetFile], { stdio: ['pipe', 'pipe', 'pipe'] });
  console.log(`eslint fixed '${targetFile}'`);
}
