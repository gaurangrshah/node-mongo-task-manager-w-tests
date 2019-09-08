const mongoose = require('mongoose')
const validator = require('validator') // required for validation
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task') // loads in task model

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // removes whitespace
  },
  email: {
    type: String,
    unique: true, // requiring uniqueness for emails
    required: true,
    lowercase: true, // forces input to covert to lowercase
    validate(value) {
      if (!validator.isEmail(value)) { // validate invalidity of email
        throw new Error('Email is invalid')
      }
    }
  },
  age: {
    type: Number,
    default: 0, // sets a default age to 0 if no age is provided.
    validate(value) { //
      if (value < 0) {
        throw new Error('Age must be a positive number')
      }
    }
  },
  password: {
    type: String,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes('password')) {
        throw new Error('password cannot include the word "password"')
      }
    },
  },
  tokens: [{
    token: {
      type: String,
      required: true
    }
  }],
  avatar: {
    // stores the image data from buffer
    type: Buffer
  }

}, {
  // insert timestamp related fields here.
  timestamps: true  // default = false
})

// configures the relationship between users and tasks
userSchema.virtual('tasks', {
  ref: 'Task', // refernce to the task model
  localField: '_id', // id from user
  foreignField: 'owner' // references 'owner' from tasks
})

userSchema.methods.toJSON = function () {
  const user = this // refrence access to this
  // get back raw object with user data attached -- `removes all bloat from mongoose, etc...
  const userObject = user.toObject()

  // remove tokens array and password from the userObject
  delete userObject.password
  delete userObject.tokens
  delete userObject.avatar

  return userObject
}

userSchema.methods.generateAuthToken = async function () {
  const user = this
  // const token = jwt.sign({ _id: user.id.toString() }, 'thisismysupersecretpw')
  const token = jwt.sign({ _id: user.id.toString() }, process.env.JWT_SECRET)
  // add token to user's token array:
  user.tokens = user.tokens.concat({ token })
  // saves updated token:
  await user.save()

  return token
}

// setting up method on statics so it can be accessed from the user model.
userSchema.statics.findByCredentials = async (email, password) => {
  console.log('finding user')
  const user = await User.findOne({ email }) // find user by email
  if (!user) throw new Error('Unable to login') // handle error

  // console.log('user: ', user)
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) throw new Error('Unable to login, either') // handle error

  console.log('user logged in')
  return user // handle success
}

// hash plain text password before saving to db
userSchema.pre('save', async function (next) {
  // setup userSchema -- cannot use arrow function -- needs 'this' binding
  const user = this // creating a reference to 'this'
  // will only be true if user is being created, or if password is beng updated
  if (user.isModified('password')) {
    // hash plain text password and overwrite original
    user.password = await bcrypt.hash(user.password, 8)
  }
  // console.log('just before saving')
  next() // allows application to proceed with next item in the stack.
})


// Delete user tasks when user is removed:
userSchema.pre('remove', async function (next) {
  const user = this

  await Task.deleteMany({ owner: user._id })

  next();
})

// create User model with name & age ++ email properties:
const User = mongoose.model('User', userSchema) // adds userSchema to model



module.exports = User
