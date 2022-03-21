//@ts-check
const path = require('path');

const productionConfig = {
  mode: 'production',

  entry: '../../lib/main.ts',

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
    path: path.resolve(__dirname, '../../dist'),
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
      { directory: path.resolve(__dirname, '../../dist') },
      { directory: path.resolve(__dirname, '../../tutorials') },
    ],
    client: {
      overlay: {
        warnings: false,
        errors: true,
      },
    },
  },

  output: {
    path: path.resolve(__dirname, '../../dist'),
    library: 'canvasDatagrid',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: 'canvas-datagrid.debug.js',
    sourceMapFilename: 'canvas-datagrid.debug.map',
  },
};

module.exports = [productionConfig, developmentConfig];
