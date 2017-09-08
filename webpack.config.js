const path = require('path')

module.exports = {
    devtool: 'source-map',
    entry: './src/entry.js',
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'tiny.pictures.min.js'
    },
    module: {
        loaders: [
            {test: /\.js$/, loader: 'babel-loader'}
        ]
    }
}
