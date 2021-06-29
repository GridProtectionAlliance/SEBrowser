"use strict";
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = env => {
    if (env.NODE_ENV == undefined) env.NODE_ENV = 'development';
    return {
        mode: env.NODE_ENV,
        context: path.resolve(__dirname),
        cache: true,
        entry: {
            SEBrowser: "./Scripts/TSX/SEBrowser.tsx",

        },
        output: {
            path: path.resolve(__dirname, 'Scripts'),
            publicPath: 'Scripts/',
            filename: "[name].js"
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: "inline-source-map",

        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"]
        },
        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                {
                    test: /\.tsx?$/,
                    include: path.resolve(__dirname, "Scripts"),
                    loader: "ts-loader", options: { transpileOnly: true }
                },
                {
                    test: /\.css$/,
                    include: path.resolve(__dirname, "Content"),
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                {
                    test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    loader: 'url-loader',
                    options: { limit: 100000 }
                }
            ]
        },
        externals: {
            d3: 'd3',
        },
        optimization: {
            minimizer: [
                new TerserPlugin({ extractComments: false })
            ],
        },
        plugins: [
            new NodePolyfillPlugin(),
            new ForkTsCheckerWebpackPlugin()
        ]
    };
}