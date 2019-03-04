const base = require('./webpack.config');
const merge = require('webpack-merge');
const webpack = require('webpack');

module.exports = merge(base, {
    devtool: 'source-map',
    mode: 'production',
    plugins: [
        new webpack.LoaderOptionsPlugin({
            minimize: true
        })
    ],
});