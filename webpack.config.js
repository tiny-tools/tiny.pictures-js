const path = require('path')

module.exports = function (env, argv) {
    return {
        mode: argv.mode,
        devtool: argv.mode === 'production' ? 'source-map' : 'cheap-module-eval-source-map',
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
                            presets: ['babel-preset-env'],
                        },
                    },
                },
            ],
        },
    }
}
