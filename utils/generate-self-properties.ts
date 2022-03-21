import * as fs from 'fs';
import * as path from 'path';
import * as glob from 'glob';
import * as acorn from 'acorn';
import * as acornWalk from 'acorn-walk';
// import * as astring from 'astring';

const dir = process.argv[2];

const methods = [];
const fields = [];
const existedNames = new Set<string>();
const main = () => {
  if (!fs.existsSync(dir)) throw new Error(`"${dir}" is not a directory!`);
  glob('**/*.js', { cwd: dir }, (err, files) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
      const file = path.resolve(dir, files[i]);
      const js = fs.readFileSync(file, 'utf8');
      const ast = acorn.parse(js, { ecmaVersion: 2020, sourceType: 'module' });
      acornWalk.full(ast, (node) => {
        let ok = false;
        try {
          ok = methodMatcher(node);
        } catch (error) {
          console.error(error);
          return;
        }
        if (ok) {
          const str = methodStringify(node);
          if (str) methods.push(str);
        }

        ok = false;
        try {
          ok = fieldMatcher(node);
        } catch (error) {
          console.error(error);
          return;
        }
        if (ok) {
          const str = fieldStringify(node);
          if (str) fields.push(str);
        }
      });
    }
    const target = path.resolve(__dirname, 'generated.ts');
    fs.writeFileSync(
      target,
      [
        '/* eslint-disable @typescript-eslint/no-explicit-any */',
        '',
        'export interface SelfParameterForModule',
        '  extends MethodsInTheGridItself,',
        '    FieldsInTheGridItself {}',
        '',
        'export interface MethodsInTheGridItself {',
        methods
          .join('\n')
          .split('\n')
          .map((it) => `  ${it}`)
          .join('\n'),
        '}\n',
        'export interface FieldsInTheGridItself {',
        fields
          .join('\n')
          .split('\n')
          .map((it) => `  ${it}`)
          .join('\n'),
        '}\n',
      ].join('\n'),
    );
    console.log(` fields: ${fields.length}`);
    console.log(`methods: ${methods.length}`);
    console.log(`done: ${target}`);
  });
};

const methodMatcher = (node: any) => {
  let ok = matchNode(
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'self',
          },
        },
        right: {
          type: (t) =>
            t === 'FunctionExpression' || t === 'ArrowFunctionExpression',
        },
      },
    },
    node,
  );
  return ok;
};
const methodStringify = (node: any) => {
  const propName = node.expression.left.property.name;
  if (existedNames.has(propName)) return '';

  const lastIndex = node.expression.right.params.length - 1;
  const params = node.expression.right.params
    .map((it, index) => {
      let itsName: string = it.name;
      let optional = index === lastIndex;
      let type = 'any';
      const getResult = () => `${itsName}${optional ? '?:' : ':'} ${type}`;
      if (!itsName) {
        optional = true;
        if (it.type === 'AssignmentPattern') {
          // optionalArg = false
          itsName = it.left.name;
          type = typeof it.right.value;
          return getResult();
        }
        // console.log(it);
        itsName = `arg${index}`;
        return getResult();
      }

      if (
        itsName === 'x' ||
        itsName === 'y' ||
        itsName === 'offsetX' ||
        itsName === 'offsetY' ||
        itsName === 'index' ||
        itsName === 'width' ||
        itsName === 'height' ||
        itsName.endsWith('Index')
      ) {
        type = 'number';
        return getResult();
      }
      if (index === 0) {
        if (itsName === 'e' || itsName === 'event' || itsName === 'ev') {
          type = propName === 'dispatchEvent' ? 'string' : 'Event';
          return getResult();
        }
      }

      if (itsName === 'sortFunction') optional = true;
      if (itsName === 'sanitized' || itsName === 'expandToRow') {
        optional = true;
        type = 'boolean';
        return getResult();
      }

      if (itsName === 'internal') {
        optional = true;
        type = 'boolean';
      } else if (itsName === 'NativeEvent') type = 'Event';
      else if (itsName.endsWith('Name') || itsName === 'name') type = 'string';
      else if (itsName.startsWith('dont')) type = 'boolean';
      return getResult();
    })
    .join(', ');

  existedNames.add(propName);
  const result = [propName, '?: (', params, ') => any;'];
  return result.join('');
};

const fieldMatcher = (node: acorn.Node) => {
  let ok = matchNode(
    {
      type: 'ExpressionStatement',
      expression: {
        type: 'AssignmentExpression',
        operator: '=',
        left: {
          type: 'MemberExpression',
          object: {
            type: 'Identifier',
            name: 'self',
          },
        },
        right: {
          type: (t) =>
            t === 'ArrayExpression' ||
            t === 'ObjectExpression' ||
            t === 'Literal',
        },
      },
    },
    node,
  );
  return ok;
};
const fieldStringify = (node: any) => {
  const propName = node.expression.left.property.name;
  if (existedNames.has(propName)) return '';

  let type: string;
  const right = node.expression.right;
  switch (right.type) {
    case 'Literal':
      type = typeof right.value;
      break;
    case 'ObjectExpression':
      type = 'any';
      break;
    case 'ArrayExpression':
      type = 'any[]';
      break;
  }
  if (!type) return '';

  existedNames.add(propName);
  const result = [propName, '?: ' + type + ';'];
  return result.join('');
};

function matchNode(pattern: any, node: acorn.Node): boolean {
  const keys = Object.keys(pattern);
  if (!node || typeof node !== 'object') return false;

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const expected = pattern[key];
    const expectedType = typeof expected;
    let result = false;
    if (expectedType === 'object') result = matchNode(expected, node[key]);
    else if (expectedType === 'function')
      result = expected(node[key], node, key);
    else result = expected === node[key];
    if (!result) return false;
  }
  return true;
}

main();
