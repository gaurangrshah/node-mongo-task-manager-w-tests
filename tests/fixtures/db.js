const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')

const userOneId = new mongoose.Types.ObjectId() // generate ObjectID

const userOne = {
  _id: userOneId,
  name: 'Mike',
  email: 'mike@email.com',
  password: 'Computer098',
  tokens: [{ // generate and assign token to user's tokens array:
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

const userTwoId = new mongoose.Types.ObjectId() // generate ObjectID

const userTwo = {
  _id: userTwoId,
  name: 'Tim',
  email: 'tim@email.com',
  password: 'Computer098',
  tokens: [{ // generate and assign token to user's tokens array:
    token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET)
  }]
}

const taskOne = {
  _id: new mongoose.Types.ObjectId(),
  description: 'First Task',
  completed: false,
  owner: userOne._id
}

const taskTwo = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Second Task',
  completed: false,
  owner: userOne._id
}

const taskThree = {
  _id: new mongoose.Types.ObjectId(),
  description: 'Third Task',
  completed: true,
  owner: userTwo._id
}

const setupDatabase = async () => {
  await User.deleteMany()
  // console.log('cleared users')
  await Task.deleteMany()
  // console.log('cleared tasks')
  await new User(userOne).save()
  await new User(userTwo).save()
  // console.log('saved new users')
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
  // console.log('saved new tasks')
}

module.exports = {
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
}
