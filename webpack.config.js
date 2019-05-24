const path = require('path')

module.exports = function (env, {mode}) {
    return {
        mode,
        entry: {
            browser: './src/browser.js'
        },
        output: {
            path: path.join(__dirname, 'dist'),
            filename: '[name].js',
            library: 'TinyPictures',
            libraryTarget: 'umd',
        },
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env'],
                        },
                    },
                },
            ],
        },
    }
}
