//@ts-check

// const code = 'self.draw = function a(x, b) {}';
// const code = 'self.selections = [];';
// const code = 'self.fillOverlay = {};';
const code = 'self.frozenRow = 0;';

const acorn = require('acorn');
const node = acorn.parse(code, { ecmaVersion: 2017, sourceType: 'module' });
console.log(JSON.stringify(node, null, 2));

