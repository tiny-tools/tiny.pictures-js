const webpack = require('webpack')

module.exports = {
    entry: "./src/entry.js",
    output: {
        path: 'dist',
        filename: "tiny.pictures.min.js"
    },
    module: {
        loaders: [
            {test: require.resolve('./src/tiny.pictures.js'), loader: 'expose?tiny'},
            {test: /\.js$/, loader: 'babel'}
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin()
    ]
}
