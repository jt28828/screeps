const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const DefinePlugin = require("webpack").DefinePlugin;


module.exports = {
    mode: "production",
    entry: './ts-dist/main.js',
    output: {
        libraryTarget: "commonjs2",
        path: path.resolve(__dirname, 'dist')
    },
    target: "node",
    node: {
        global: true,
        __filename: false,
        __dirname: false,
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {},
                    compress: {},
                    mangle: false, // Note `mangle.properties` is `false` by default.
                },
            }),
        ],
    },
    plugins: [
        new DefinePlugin({
            VERSION: JSON.stringify(require("./package.json").version)
        })
    ]
};
