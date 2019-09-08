// tests all user related functionality:
const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app') // imports app logic.
const User = require('../src/models/user') // imports User model


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


beforeEach(async () => {
  await User.deleteMany()
  // console.log('cleared users')
  await new User(userOne).save()
  // console.log('saved new user')
})


test('Should signup a new user', async () => {
  // using supertest to test the POST method to the /users endpoint
  const response = await request(app).post('/users').send({ //store as response
    // the .send() method is what allows us to send data across the wire
    name: 'Test',
    email: 'test@email.com',
    password: 'Computer098'
  }).expect(201) // if sucessful, should return 201

  // Assert that the database gets updated with new user correctly
  const user = await User.findById(response.body.user._id)
  // check if user is !null, means a matching user was found:
  expect(user).not.toBeNull()
  // ".not" flips the expectation to the opposite of '.tobeNull()'

  // Assertions about the response body:
  // expect(response.body.user.name).toBe('Test User')
  expect(response.body).toMatchObject({
    user: {
      name: 'Test',
      email: 'test@email.com'
    },
    token: user.tokens[0].token
  })

  // assert that password is not saved as plain text:
  expect(user.password).not.toBe('Computer098')
})


test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(200)

  // Assert that new token is also saved onto [tokens]
  const user = await User.findById(userOneId)
  expect(response.body.token).toBe(user.tokens[1].token)
})


test('Should not login nonexistent user', async () => {
  await request(app).post('/users/login').send({
    email: userOne.email,
    password: 'thisisthewrongpw'
  }).expect(400)
})



test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for authenticated user', async () => {
  await request(app)
    .delete('/users/me/')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  // Validate user is removed
  const user = await User.findById(userOneId)
  expect(user).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me/')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/profile-pic.jpg')
    // attach allows to attach a file to the request.
    .expect(200)

  // Assert that image is saved as buffer to user profile:
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
  // '.toEqual()' is used when checking equality of objects
})


test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      name: 'Jim'
    })
    .expect(200)

  // Assert that user name matches updated name:
  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Jim')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Toronto'
    })
    .expect(400)
})
