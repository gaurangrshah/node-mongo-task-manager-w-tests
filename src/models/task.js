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
    required: true,
    ref: 'User' // provides model name to use for referenced data
  }
}, {
  // enables timestamps
  timestamps: true
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
