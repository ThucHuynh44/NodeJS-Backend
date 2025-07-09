const express = require('express')
const {default: helmet} = require('helmet') 
const compression = require('compression');
const morgan = require('morgan')
const app = express()

//init middleware
app.use(morgan('dev'))
app.use(helmet())
app.use(compression());
//init db

// init routes
app.get('/', (req,res, next) =>
{
    const strCompress = 'hello haha'
    return res.status(200).json({
        message: 'Welcom ThucHuynh!',
        metadata: strCompress.repeat(10000)
    })
})
// handing error

module.exports = app