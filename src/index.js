const express = require('express')
const multer = require('multer')
// explictly requiring the file to ensure app connects to database when it loads
require('./db/mongoose')

const userRouter = require('./routers/user') // imports endpoint router for users
const taskRouter = require('./routers/task') // imports endpoint router for tasks

const app = express() // setup new express server.
const port = process.env.PORT  // assign port depending on environment

// allows express to auto parse incoming json into a js object:
app.use(express.json())
// registers and loads each specified endpoint router:
app.use(userRouter)
app.use(taskRouter)


app.listen(port, () => { // start server on assigned port
  console.log('Server is up on port: ' + port)
})
