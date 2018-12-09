import { request } from 'graphql-request'

import { User } from '../../entity/User';
import { startServer } from '../../startServer';

// function sum(a: number, b: number) {
//   return a + b
// }

// test("adds 1 + 2 tp equal 3", () => {
//   expect(sum(1, 2)).toBe(3)
// })

let getHost = () => ''

beforeAll(async () => {
  await startServer()
  getHost = () => `http://localhost:8888`
})

const email = 'ddddddd@ddd.com'
const password = '123456'
const mutation = `
  mutation {
    register(email: "${email}", password: "${password}")
  }
`

test("Register user", async () => {
  const response = await request(getHost(), mutation)
  expect(response).toEqual({ register: true })
  const users = await User.find({ where: { email } })
  expect(users).toHaveLength(1)
  const user = users[0]
  expect(user.email).toEqual(email)
  expect(user.password).not.toEqual(password)
})
