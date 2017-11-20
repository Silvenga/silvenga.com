const path = require("path");

module.exports = {
    entry: "./src/main.ts",

    output: {
        path: path.resolve("dist"),
        filename: "[name].js",
        chunkFilename: "[name].js"
    },

    resolve: {
        extensions: [".ts", ".js"],
        modules: ["src", "node_modules"].map(x => path.resolve(x)),
    },

    module: {
        loaders: [
            // note that babel-loader is not required
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
            }, {
                test: /\.scss$/,
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
            }
        ]
    },

    devServer: {
        contentBase: path.join(__dirname, "../output"),
        port: 9000
    }
}