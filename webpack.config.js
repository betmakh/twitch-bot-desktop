'use strict';
const path = require('path');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

let distFolder = path.resolve(__dirname, 'dist');

module.exports = env =>
  env && env.prod == 'true'
    ? {
        target: 'electron-renderer',
        entry: './src/app.js',
        output: {
          filename: 'app.js',
          path: distFolder
        },
        plugins: [
          new UglifyJsPlugin(),
          new CleanWebpackPlugin([distFolder]),
          new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
          })
        ],
        module: {
          rules: [
            {
              test: /\.js$|\.jsx$/,
              exclude: /node_modules/,
              loader: 'babel-loader'
            }
          ]
        }
      }
    : {
        entry: './src/app.js',
        target: 'electron-renderer',
        output: {
          filename: 'app.js',
          path: distFolder
        },
        watch: true,
        devtool: 'eval-source-map',
        module: {
          rules: [
            {
              test: /\.js$|\.jsx$/,
              exclude: /node_modules/,
              loader: 'babel-loader'
            }
          ]
        }
      };
