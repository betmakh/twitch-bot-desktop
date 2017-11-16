const path = require('path');
// const CleanWebpackPlugin = require('clean-webpack-plugin');

let distFolder = path.resolve(__dirname, 'dist');

module.exports = {
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
                test: /\.css$/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
            },
            {
                test: /\.js$|\.jsx$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
};
