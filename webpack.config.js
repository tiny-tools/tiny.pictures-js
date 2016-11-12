const webpack = require("webpack")

module.exports = {
    entry: "./src/tiny.pictures.js",
    output: {
        path: 'dist',
        filename: "tiny.pictures.min.js"
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
}
