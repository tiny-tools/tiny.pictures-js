const path = require('path')

module.exports = {
    mode: 'development',
    entry: {
        browser: './src/browser.js'
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        library: 'TinyPictures',
        libraryTarget: 'umd',
    }
}
