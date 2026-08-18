"use strict";
const path = require("path");
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = env => {
    if (env.NODE_ENV == undefined) env.NODE_ENV = 'development';
    return {
        mode: env.NODE_ENV,
        context: path.resolve(__dirname),
        cache: true,
        entry: {
            PQBrowser: "./Scripts/TSX/PQBrowser.tsx",
        },
        output: {
            path: path.resolve(__dirname, 'wwwroot', 'Scripts'),
            publicPath: 'Scripts/',
            filename: "[name].js",
            chunkFilename: "[name].js"
        },
        // Enable sourcemaps for debugging webpack's output.
        devtool: "inline-source-map",
        resolve: {
            // Add '.ts' and '.tsx' as resolvable extensions.
            extensions: [".webpack.js", ".web.js", ".ts", ".tsx", ".js", ".css"],
            alias: {
                leaflet_css: __dirname + "/node_modules/leaflet/dist/leaflet.css"
            }
        },
        module: {
            rules: [
                // All files with a '.ts' or '.tsx' extension will be handled by 'ts-loader'.
                {
                    test: /\.tsx?$/,
                    include: [
                        path.resolve(__dirname, "Scripts"),
                        path.resolve(__dirname, "EventWidgets") 
                    ],
                    loader: "ts-loader", options: { transpileOnly: true }
                },
                {
                    test: /\.css$/,
                    include: path.resolve(__dirname, "Content"),
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                {
                    test: /leaflet\.css$/,
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                {
                    test: /main\.css$/,
                    use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
                },
                {
                    //loader is the default asset loader in webpack 5
                    test: /\.(woff|woff2|ttf|eot|svg|png|gif)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    type: 'asset',
                    parser: { dataUrlCondition: { maxSize: 100000 } }
                }
            ]
        },
        externals: {
        },
        optimization: {
            minimizer: [
                new TerserPlugin({ extractComments: false })
            ],
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin()
        ]
    };
}
