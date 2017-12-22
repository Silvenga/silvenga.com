const path = require("path");
const glob = require("glob");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = {
    entry: {
        main: ["./src/main.ts", "./src/styles/main.scss"],
        'gist-loader': "./src/components/gists/gist-loader"
    },
    output: {
        path: path.resolve("../dist"),
        filename: "[name].js",
        chunkFilename: "[name].js"
    },

    resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"].map(x => path.resolve(x)),
    },
    devtool: "source-maps",
    module: {
        loaders: [
            {
                test: /\.ts$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        { loader: 'css-loader?sourceMap', options: { importLoaders: 1 } },
                        'postcss-loader?sourceMap',
                        'resolve-url-loader',
                        'sass-loader?sourceMap'
                    ]
                })
            },
            { test: /\.(jpg|png|gif|woff2|woff)$/, use: ["file-loader"] },
            { test: /\.(svg)$/, use: ["url-loader"] },

        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, '../output/**/*.html')),
            minimize: true
        }),
        new CopyWebpackPlugin([
            {
                context: "../output",
                from: '**/*'
            },
            {
                context: "../output",
                from: '404/index.html',
                to: '404.html'
            },
            {
                from: './src/assets/logo.svg',
                to: 'logo.svg'
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'gist-loader.html',
            template: './src/components/gists/gist-loader.html',
            inject: false,
            minify: {
                removeAttributeQuotes: true,
                collapseWhitespace: true,
                html5: true,
                minifyCSS: true,
                removeComments: true,
                removeEmptyAttributes: true,
            },
        }),
        new FaviconsWebpackPlugin(
            {
                logo: './src/assets/logo.svg',
                icons: {
                    android: false,
                    appleIcon: false,
                    appleStartup: false,
                    coast: false,
                    favicons: true,
                    firefox: false,
                    opengraph: false,
                    twitter: false,
                    yandex: false,
                    windows: false
                },
                prefix: './'
            })
    ],
    node: {
        fs: 'empty'
    },
    devServer: {
        contentBase: path.join(__dirname, "./dummy"),
        port: 9000
    }
}