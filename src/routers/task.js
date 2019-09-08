const express = require('express') // allows us to instantiate a new router
const auth = require('../middleware/auth')
const Task = require('../models/task')

// create a new router instance
const router = new express.Router()

// create task endpoint:
router.post('/tasks', auth, async (req, res) => { // adds authentication requirement
  const task = new Task({
    ...req.body, // copy all properties provided by user
    owner: req.user._id  // associate task authenticated user
  })

  try {
    await task.save()
    res.status(201).send(task)
  } catch (e) {
    res.status(400).send(e)
  }
})

// fetch all tasks
router.get('/tasks', auth, async (req, res) => {
  const match = {}

  if (req.query.completed) {
    match.completed = req.query.completed === 'true'
    // if req.query.completed is true, then match compelted is set to true, otherwise always false.
  }

  try {
    const user = req.user
    await user.populate({
      path: 'tasks',
      match,
    }).execPopulate()
    res.send(req.user.tasks)
  } catch (e) {
    res.status(500).send()
  }
})

// fetch single task by id
router.get('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {

    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send()
    }
    res.send(task)
  } catch (e) {
    res.status(500).send(e.message)
  }

})

router.patch('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  const updates = Object.keys(req.body) // creates an array of all available properties as "strings"
  const allowedUpdates = ['completed', 'description']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
    return res.status(400).send({ error: 'invalid updates' })
  }

  try {
    // find all matching tasks related to the owner:
    const task = await Task.findOne({ _id, owner: req.user._id })

    if (!task) {
      return res.status(404).send(e)
    }

    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    res.send(task)
  } catch (e) {
    console.log(e.message)
    res.status(400).send(e)
  }
})


router.delete('/tasks/:id', auth, async (req, res) => {
  const _id = req.params.id

  try {
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id })
    if (!task) { // handle not found
      return res.status(404).send()
    }
    res.send(task) // handle success
  } catch (e) {
    res.status(500).send(e) //handle error
  }
})



module.exports = router
