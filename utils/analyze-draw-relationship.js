#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const acorn = require('acorn');
const acornWalk = require('acorn-walk');

const file = path.resolve(__dirname, '../../lib/draw.js');
const report = path.resolve(__dirname, 'report.txt');
const js = fs.readFileSync(file, 'utf8');

const node = acorn.parse(js, { ecmaVersion: '2017', sourceType: 'module' });

/** @type {acorn.Node} */
let nodeDraw;

/** @type {string[]} */
const functionNames = [];
/** @type {Map<string, string[]>} */
const functionCalls = new Map();
const addCall = (from, call) => {
  if (functionCalls.has(from)) functionCalls.get(from).push(call);
  else functionCalls.set(from, [call]);
}

acornWalk.simple(node, {
  ExpressionStatement(n) {
    if (nodeDraw) return;
    let matched = false;
    try {
      matched = n.expression.type === 'AssignmentExpression'
        && n.expression.left.type === 'MemberExpression'
        && n.expression.left.object.type === 'Identifier'
        && n.expression.left.object.name === 'self'
        && n.expression.left.property.type === 'Identifier'
        && n.expression.left.property.name === 'draw'
        && n.expression.right.type === 'FunctionExpression'
    } catch (error) {
      // noop
    }
    if (matched) {
      nodeDraw = n.expression.right.body
      // console.log(nodeDraw)
    }
  }
});
if (!nodeDraw) throw new Error(`nodeDraw is not found!`);
const isEqNodeDraw = (node) => node && node.start === nodeDraw.start && node.end === nodeDraw.end;

acornWalk.ancestor(nodeDraw, {
  FunctionDeclaration(n, state, as) {
    assert(n.id.type, 'Identifier');
    const parent = as[as.length - 2];
    if (!parent || !isEqNodeDraw(parent)) return;

    const funcName = n.id.name;
    functionNames.push(funcName);
    // console.log(funcName, as)
  },
  CallExpression(n, state, as) {
    if (n.callee.type !== 'Identifier') return;
    const parent = as[as.length - 2];
    if (!parent) return;

    const call = n.callee.name;
    const funcNode = as.find(it => it.type === 'FunctionDeclaration' && it.id.type === 'Identifier');
    if (funcNode)
      return addCall(funcNode.id.name, call)

    return addCall('', call);
  }
});

console.log(functionNames)
// console.log(functionCalls)



const reports = [];
const rootCalls = functionCalls.get('');
functionNames.sort((a, b) => {
  const indexA = rootCalls.indexOf(a);
  const indexB = rootCalls.indexOf(b);
  return indexA - indexB;
})
for (let i = 0; i < functionNames.length; i++) {
  const funcName = functionNames[i];
  const index = rootCalls.indexOf(funcName);
  if (index >= 0) reports.push(String(index + 1) + '.' + funcName)
  else reports.push(funcName)

  let calls = functionCalls.get(funcName);
  if (calls && calls.length > 0) {
    calls = Array.from(new Set(calls));
    reports.push(...calls.map(it => `   -> ${it}`));
  }
}
fs.writeFileSync(report, reports.join('\n'))
console.log(report)
