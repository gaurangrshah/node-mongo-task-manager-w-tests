const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
  console.log('authenticating...')
  try {
    const token = req.header('Authorization').replace('Bearer ', '')
    // console.log('found token: ', token) // test if token is avaialble

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // verify that the token is still valid (i.e., user is still logged in):
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })

    //handle errors
    if (!user) {
      throw new Error() // no provided error message (argument) will trigger catch(e) below.
    }
    // console.log('authenticated... ', token)

    // expose a reference to auth token from request to endpoint.
    req.token = token
    // create a user property on request to provide route handler with access to user
    req.user = user
    // console.log(req.token, req.user)
    next() // run route handler if user is authenticated
  } catch (e) {
    res.status(401).send({ error: 'Please authenticate' })
  }

}

module.exports = auth
