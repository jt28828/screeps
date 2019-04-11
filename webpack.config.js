const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');


module.exports = {
    entry: './ts-dist/main.js',
    output: {
        path: path.resolve(__dirname, 'dist')
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
};