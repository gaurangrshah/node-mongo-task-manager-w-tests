
const app = require('./app') // imports the app w/o server

const port = process.env.PORT  // assign port depending on environment

app.listen(port, () => { // start server on assigned port
  console.log('Server is up on port: ' + port)
})
