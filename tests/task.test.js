const request = require('supertest')
const app = require('../src/app') // loads app logic.
const Task = require('../src/models/task')
const { // loads dummy db setup
  userOneId,
  userOne,
  userTwoId,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase
} = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: 'New Test Task'
    })
    .expect(201)

  // Assert that task gets created and saved correctly:
  const task = await Task.findById(response.body._id)
  expect(task).not.toBeNull()

  const { completed } = task
  // Assert that task uses the default completed property value (false):
  expect(completed).toBe(false)
})


test('Should return all tasks by User', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)

  // Assert length of tasks array
  expect(response.body.length).toEqual(2)
})

test('User cannot delete tasks belonging to another user', async () => {
  const response = await request(app)
    .delete(`/task/${taskOne._id}`)
    .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404)

  // Assert task is still in database
  const task = await Task.findById(taskOne._id)
  expect(task).not.toBeNull()
})
