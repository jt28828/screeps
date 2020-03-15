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
            VERSION: JSON.stringify(require("./package.json").version),
            BUILD_DATE: JSON.stringify(getCurrentDateString()),
        })
    ]
};

function getCurrentDateString() {
    const date = new Date();

    let monthString = "";

    switch (date.getMonth()) {
        case 0:
            monthString = "Jan";
            break;
        case 1:
            monthString = "Feb";
            break;
        case 2:
            monthString = "Mar";
            break;
        case 3:
            monthString = "Apr";
            break;
        case 4:
            monthString = "May";
            break;
        case 5:
            monthString = "Jun";
            break;
        case 6:
            monthString = "Jul";
            break;
        case 7:
            monthString = "Aug";
            break;
        case 8:
            monthString = "Sep";
            break;
        case 9:
            monthString = "Oct";
            break;
        case 10:
            monthString = "Nov";
            break;
        case 11:
            monthString = "Dec";
            break;
    }

    return `${date.getDate()} ${monthString} ${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}`;

}
