const express = require('express')
require('./db/mongoose') // explictly requirement ensure db laods when file loads

const userRouter = require('./routers/user') // imports endpoint router for users
const taskRouter = require('./routers/task') // imports endpoint router for tasks

const app = express() // setup new express server.

// allows express to auto parse incoming json into a js object:
app.use(express.json())

// registers and loads each specified endpoint router:
app.use(userRouter)
app.use(taskRouter)

module.exports = app // exports app setup with out app.listen()
