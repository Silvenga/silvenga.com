const path = require("path");
const glob = require("glob");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const PurifyCSSPlugin = require('purifycss-webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        main: ["./src/main.ts", "./src/styles/main.scss"],
        fonts: "./src/styles/fonts.scss",
        'gist-loader': "./src/components/gists/gist-loader"
    },
    output: {
        path: path.resolve("dist"),
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
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    },
                    'ts-loader'
                ],
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: "css-loader", options: {
                                sourceMap: true
                            }
                        }, {
                            loader: "sass-loader", options: {
                                sourceMap: true
                            }
                        }
                    ]
                })
            },
            { test: /\.(jpg|png|gif|woff2|woff)$/, use: ["file-loader"] }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name].css'),
        new PurifyCSSPlugin({
            paths: glob.sync(path.join(__dirname, 'staging/**/*.html')),
        }),
        new CopyWebpackPlugin([
            {
                context: "staging",
                from: '**/*'
            }
        ]),
        new HtmlWebpackPlugin({
            filename: 'gist-loader.html',
            template: './src/components/gists/gist-loader.html',
            inject: false
        })
    ],
    node: {
        fs: 'empty'
    },
    devServer: {
        contentBase: path.join(__dirname, "./dummy"),
        port: 9000
    },
    watchOptions: {
        poll: 200
    }
}