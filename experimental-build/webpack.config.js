//@ts-check
const fs = require('fs');
const path = require('path');

const projectRoot = process.env.PROJECT_ROOT || '../..';
if (!fs.existsSync(projectRoot)) throw new Error(`project directory '${projectRoot}' is not existing`);

let entry = path.resolve(projectRoot, 'lib/main.ts');
if (!fs.existsSync(entry)) entry = path.resolve(projectRoot, 'lib/main.js');

const productionConfig = {
  mode: 'production',

  entry,

  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        exclude: /node_modules/,
        loader: 'swc-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  output: {
    path: path.resolve(projectRoot, 'dist'),
    library: 'canvasDatagrid',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: 'canvas-datagrid.js',
  },
};

const developmentConfig = {
  ...productionConfig,

  mode: 'development',
  devtool: 'source-map',
  devServer: {
    static: [
      { directory: path.resolve(projectRoot, 'dist') },
      { directory: path.resolve(projectRoot, 'tutorials') },
    ],
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },

  output: {
    path: path.resolve(projectRoot, 'dist'),
    library: 'canvasDatagrid',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: 'canvas-datagrid.debug.js',
    sourceMapFilename: 'canvas-datagrid.debug.map',
  },
};

module.exports = [productionConfig, developmentConfig];
