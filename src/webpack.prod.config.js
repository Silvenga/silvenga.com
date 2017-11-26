const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const Base = require('./webpack.config');
const merge = require('webpack-merge');

module.exports = merge(Base, {
    devtool: 'source-map',
    plugins: [
        new UglifyJsPlugin({
            sourceMap: true
        })
    ],
});