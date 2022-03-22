import { existsSync } from "fs";
import { resolve as resolvePath } from "path";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import swc from 'rollup-plugin-swc';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import clear from 'rollup-plugin-clear';

const projectRoot = process.env.PROJECT_ROOT || '../..';
if (!existsSync(projectRoot)) throw new Error(`project directory '${projectRoot}' is not existing`);

let input = resolvePath(projectRoot, 'lib/main.ts');
if (!existsSync(input)) input = resolvePath(projectRoot, 'lib/main.js');

const fileName = 'canvas-datagrid';
const swcConfig = {
  minify: true,
  env: {
    coreJs: 3,
    mode: 'entry',
    targets: '> 0.25%, not dead',
  },
  jsc: {
    parser: {
      syntax: 'typescript',
    },
    loose: true,
    minify: {
      compress: {
        unused: true,
      },
      mangle: true,
    },
  },
};

export default {
  input,
  plugins: [
    clear({ targets: [resolvePath(projectRoot, 'dist')] }),
    nodeResolve({ extensions: ['.ts', '.js'] }),
    swc(swcConfig),
    replace({
      'window.EXCLUDE_GLOBAL': 'true',
    }),
    commonjs(),
  ],
  output: {
    file: resolvePath(projectRoot, `dist/${fileName}.module.js`),
    sourcemap: true,
  },
};
