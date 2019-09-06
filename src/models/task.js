const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  owner: {
    // defines own by their objectId (using mongoose)
    type: mongoose.Schema.Types.ObjectId,
    // each task must have an owner associated to it.
    required: true,
    ref: 'User' // provides model name to use for referenced data
  }
}, {
    // enables timestamps
    timestamps: true
  })

// 2nd argument passes in the schema defined above.
const Task = mongoose.model('Task', taskSchema)

module.exports = Task
