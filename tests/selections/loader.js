const fs = require('fs');
const path = require('path');
const assert = require('assert');

function setup() {
  const src = path.resolve(__dirname, '../../../lib/selections/util.js');
  const dest = path.resolve(__dirname, 'util.js');
  const moduleDest = path.resolve(__dirname, 'module.js');
  let content = fs.readFileSync(src, 'utf8');
  fs.writeFileSync(moduleDest, content);
  content = content.replace(/export\s+\{/, 'module.exports = {');
  fs.writeFileSync(dest, content);
}

// simple implementations of chai, mocha:
const it = (title, callback) => {
  console.log(`# ${title}`);
  callback();
};
const chai = { assert };
setup();

module.exports = { it, chai };
