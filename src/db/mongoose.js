// require mongoose
const mongoose = require('mongoose')

// the connection url specifies the databasee name as the last /param
// mongoose.connect('mongodb://xcoder.tk:27017/task-manager-api', {
mongoose.connect('mongodb://' + process.env.MONGODB_URL, {   // 2nd arg: {options}
  // required by mongodb
  useNewUrlParser: true,
  // allows mongoose to index data stored in mongodb for speed / performance.
  useCreateIndex: true,
  // allows mongoose to use findAndModify features without warnings
  useFindAndModify: false
})
