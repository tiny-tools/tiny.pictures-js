module.exports = {
    devtool: 'source-map',
    entry: './entry.js',
    output: {
        path: 'dist',
        filename: 'tiny.pictures.min.js'
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    }
}
