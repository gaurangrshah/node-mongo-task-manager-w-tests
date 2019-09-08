const express = require('express') // allows us to instantiate a new router
const multer = require('multer') // middleware for uploads
const sharp = require('sharp') // used for processing images
const User = require('../models/user') // requires the user model

// require middleware for authentication
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancelEmail } = require('../emails/account')

// create a new router instance
const router = new express.Router()

// setup users route to create user
router.post('/users', async (req, res) => {
  // use data from req.body to create new user
  const user = new User(req.body)
  // console.log('success ', user)

  try { // try will run the code once, and attempt a single pass.
    await user.save() // use await to save user

    // sendWelcomeEmail(user.email, user.name) // trigger welcome email

    const token = await user.generateAuthToken() // generates authentication
    res.status(201).send({ user, token })

    res.status(201).send(user) // sets status code & informs user
  } catch (e) {
    res.status(400).send() // sets status code & informs user
  }

})

router.post('/users/login', async (req, res) => {
  // find and verify user's authenticity
  try {
    // verify user with custom defined method on user model: findByCredentials
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken() // generates authentication
    // console.log(user, token)
    res.send({ user, token })
  } catch (e) {
    console.log(e)
    res.status(400).send(e.message)
  }
})


router.post('/users/logout', auth, async (req, res) => {
  try {
    // remove specified token from user profile, essentially logging the user out
    req.user.tokens = req.user.tokens.filter((token) => {
      // find token for authenticated user and return all that don't match
      return token.token !== req.token
    })

    await req.user.save() // save
    res.status(200).send() // handle success
  } catch (e) { // handle error
    res.status(500).send()
  }
})


router.post('/users/logoutAll', auth, async (req, res) => {

  try {
    req.user.tokens = [] // clears tokens array from request object

    await req.user.save()
    res.status(200).send(req.user)

  } catch (e) {
    res.status(500).send(e.message)
  }
})

// // fetch all users:
// fetch current user's profile
router.get('/users/me', auth, async (req, res) => {
  // this function only runs if the user is authenticated
  res.send(req.user) // return authenticated user's profile.
})

// update user with provided id
router.patch('/users/me', auth, async (req, res) => {

  const updates = Object.keys(req.body) // converts and stores req.body to ["strings"]
  const allowedUpdates = ['name', 'email', 'password', 'age'] // any updates we allow users to make.
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) { // ensures that user is able to perform CRUD operation.
    return res.status(400).send({ error: 'Invalid Updates' })
  }

  try {

    updates.forEach((update) => req.user[update] = req.body[update])
    // use array values to dynamically populate each property that is being updated
    await req.user.save() //executes middleware
    res.send(req.user)
  } catch (e) {
    // console.log(e.message)
    res.status(400).send(e)
  }
})

// delete user endpoint:
router.delete('/users/me/', auth, async (req, res) => {
  try {
    await req.user.remove()

    // sendCancelEmail(user.email, user.name) // trigger cancel email

    res.send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})


// setup upload with multer options:
const upload = multer({ // define options for multer:
  // removed in favor of passing the item to callback from route.
  // dest: 'avatars', // folder name that triggers this context.
  limits: {
    fileSize: 1000000, // limits filesize to 1mb
  },
  fileFilter(req, file, cb) {
    // check for matching file sizes or throw error
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error('Please upload  file'))
    }

    // if no errors:
    cb(undefined, true) // return image explictly
  }
})

// setup endpoint to allow upload of images using multer middlware:
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {

  // instantiate sharp to run when the buffer is not full
  // const buffer = await sharp(req.file.buffer).png().toBuffer()
  // specify where to find the image and set it's format.
  console.log('convert & resize:')
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  console.log('converted & resized', buffer)

  // access profile image from upload:
  req.user.avatar = buffer // stores modified image returned from buffer
  console.log('avatar created ', req.user.avatar)
  //  save profile pic to user profile:
  await req.user.save()
  console.log('saved')
  // upload.single middleware exposed from multer
  res.send()
}, (error, req, res, next) => { // callback error handler
  res.status(400).send({ error: error.message })
})


// emoves entire user instead of just removing the profile image
// delete profile image endpoint:
router.delete('/users/me/avatar', auth, async (req, res) => {
  // removes profile pic
  req.user.avatar = undefined

  // save user after removing profile pic
  await req.user.save()

  // initiate send - will default status code: 200
  res.send()
})



// fetch user's avatar:
router.get('/users/:id/avatar', async (req, res) => {
  // uses the user's id to find the associated profile image
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      // if no matching user or user profile image exists, throw error / execute catch
      throw new Error()
    }

    // if no errors: set header for expected response:
    res.set("Content-Type", "image/png")
    res.send(user.avatar) // serves the user's profile image
  } catch (e) { // handle error and set status
    res.status(404).send()
  }
})

module.exports = router
