const path = require('path')

const express = require('express')
const serveIndex = require('serve-index')
const logger = require('winston')

const port = 3000
const app = express()
app.use('/', serveIndex('demo/static', {'icons': true}))
app.use('/', express.static(path.join(__dirname, 'static')))
app.get('/tiny.pictures.min.js', (req, res) => res.sendFile(path.join(__dirname, '../dist/tiny.pictures.min.js')))
app.get('/tiny.pictures.min.js.map', (req, res) => res.sendFile(path.join(__dirname, '../dist/tiny.pictures.min.js.map')))

app.listen(port, (e) => {
    if (e) {
        return logger.error(e)
    }

    return logger.info('listening in port', port)
})
