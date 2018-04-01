'use strict';
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let distFolder = path.resolve(__dirname, 'dist');

let prodPlugins = [
  new UglifyJsPlugin(),
  new CleanWebpackPlugin([distFolder]),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production')
  })
];

let configs = {
  main: {
    entry: './src/main/main.js',
    target: 'electron-main',
    node: {
      __dirname: false,
      __filename: false
    },
    output: {
      filename: 'main.js',
      path: __dirname
    }
  },
  renderer: {
    entry: './src/renderer/app.js',
    target: 'electron-renderer',
    output: {
      filename: 'app-renderer.js',
      path: distFolder,
      publicPath: distFolder + '/'
    },
    devtool: 'eval-source-map',
    module: {
      rules: [
        {
          test: /\.worker\.js$/,
          loader: 'worker-loader'
        },
        {
          test: /\.js$|\.jsx$/,
          exclude: [/node_modules/, /\.worker\.js$/],
          loader: 'babel-loader'
        }
      ]
    }
  }
};
module.exports = env =>
  env && env.prod == 'true'
    ? [
        Object.assign({}, configs.main, {
          plugins: prodPlugins
        }),
        Object.assign({}, configs.renderer, {
          plugins: prodPlugins
        })
      ]
    : [
        Object.assign({}, configs.main, {
          devtool: 'eval-source-map',
          watch: true
        }),
        Object.assign({}, configs.renderer, {
          devtool: 'eval-source-map',
          watch: true
        })
      ];
