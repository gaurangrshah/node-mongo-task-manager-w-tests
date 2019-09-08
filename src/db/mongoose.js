// require mongoose
const mongoose = require('mongoose')

mongoose.connect('mongodb://' + process.env.MONGODB_URL, {   // 2nd arg: {options}
  // required by mongodb
  useNewUrlParser: true,
  // allows mongoose to index data stored in mongodb for speed / performance.
  useCreateIndex: true,
  // allows mongoose to use findAndModify features without warnings
  useFindAndModify: false
})
