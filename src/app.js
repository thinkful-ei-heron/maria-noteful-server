require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config'); //pulling from node env. 
const notesRouter = require('./notes/notes-router')
const foldersRouter = require('./folders/folders-router')

const app = express();

const morganOption = (NODE_ENV === 'production')   //ternary statement if/then, else
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet()) // helmet must come before cors
app.use(cors())
app.use('/api/notes',notesRouter)
app.use('/api/folders', foldersRouter)

app.get('/', (req, res) => {
       res.send('Hello, world!')
     }) // app, get root path, respond  with msge hello world 


     app.use(function errorHandler(error, req, res, next) {
        let response
        console.log(`error`)
        if (NODE_ENV === 'production') {
            response = { error: { message: 'server error' } }
           } else {
            console.error(error)
            response = { message: error.message, error }
             }
           res.status(500).json(response)
        })

        //error handeling middlewware put atff the end . We also put in 4 params .
        // if argument length === 4 , treat this as hadnleing middlewear. if it less than 1 and less than 4, then treat as normal 
        // should get error in json format, but for some reason is didnt
module.exports = app;