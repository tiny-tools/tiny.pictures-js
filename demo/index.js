const path = require('path')

const express = require('express')
const webpack = require('webpack')
const webpackOptions = require('../webpack.config')(null, {mode: 'development'})
const webpackCompiler = webpack(webpackOptions)
const webpackDevMiddleware = require('webpack-dev-middleware')
const logger = require('winston')

const TinyPictures = require('../src/node.js')
const tinyPictures = new TinyPictures({
    user: 'demo',
    namedSources: [
        {name: 'main', url: 'https://tiny.pictures/'}
    ],
})

const port = 3000
const app = express()
app.set('views', __dirname)
app.locals.tinyPictures = tinyPictures

app.use(webpackDevMiddleware(webpackCompiler, {}))
app.use(express.static(path.join(__dirname, 'static')))
app.get('/', (req, res) => res.render('./static/index.pug'))
app.get('/lazyload', (req, res) => res.render('./static/lazyload.pug'))
app.get('/lazysizes', (req, res) => res.render('./static/lazysizes.pug'))
app.get('/localhost', (req, res) => res.render('./static/localhost.pug'))
app.get('/reveal', (req, res) => res.render('./static/reveal.pug'))
app.get('/revealAll', (req, res) => res.render('./static/revealAll.pug'))

app.listen(port, (e) => {
    if (e) {
        return logger.error(e)
    }

    return logger.info('listening in port', port)
})
