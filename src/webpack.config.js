const path = require("path");
const glob = require("glob");
const PurifyCSSPlugin = require('purifycss-webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    entry: {
        main: ["./src/main.ts", "./src/styles/main.scss"],
        'gist-loader': "./src/components/gists/gist-loader"
    },
    output: {
        path: path.resolve("../dist"),
        filename: "[name].js",
        chunkFilename: "[name].js",
        publicPath: "/"
    },
    mode: "development",
    resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"].map(x => path.resolve(x))
    },
    devtool: "source-maps",
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    'babel-loader',
                    'ts-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    { loader: 'css-loader?sourceMap', options: { importLoaders: 1 } },
                    'postcss-loader?sourceMap',
                    'resolve-url-loader',
                    'sass-loader?sourceMap'
                ]
            },
            {
                test: /\.(jpg|png|gif|woff2|woff)$/,
                use: ["file-loader"]
            },
            {
                test: /\.(svg)$/,
                use: ["url-loader"]
            },
            {
                test: /\.html$/,
                include: [
                    path.resolve("../output"),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name(file) {
                                var parent = path.basename(path.dirname(file)) + "/";
                                if (parent == "output/") {
                                    parent = "";
                                }
                                if (parent == "404/") {
                                    return '404.html';
                                }
                                return parent + '[name].[ext]';
                            }
                        }
                    },
                    'extract-loader',
                    {
                        loader: 'html-loader',
                        options: {
                            attrs: [':data-src'],
                            root: "..",
                            minimize: true
                        }
                    },
                ]
            },
            {
                test: /\.(txt|xml)$/,
                include: [
                    path.resolve("../output"),
                ],
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]'
                        }
                    }
                ]
            },
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: "[name].css",
        }),
        // new PurifyCSSPlugin({
        //     paths: glob.sync(path.join(__dirname, '../output/**/*.html')),
        //     minimize: true
        // }),
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