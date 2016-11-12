const webpack = require('webpack')

module.exports = {
    entry: "./src/entry.js",
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
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            }
        })
    ]
}
