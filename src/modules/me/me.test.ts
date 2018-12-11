import axios from 'axios'
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTestConn } from '../../testUtils/createTestConn';

const email = 'bo5b0@bob.com'
const password = '123456'
let conn: Connection
beforeAll(async () => {
  conn = await createTestConn()
  await User.create({
    email,
    password,
    confirmed: true
  }).save()
})

afterAll(async () => {
  await conn.close()
})

const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

const meQuery = `
  {
    me {
      email
    }
  }
`

export const loginAndQueryMeTest = async () => {
  await axios.post(
    process.env.TEST_HOST as string,
    {
      query: loginMutation(email, password)
    }, {
      withCredentials: true
    }
  )
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    }, {
      withCredentials: true
    }
  )
  expect(response.data.data.me.email).toEqual(email)
}

export const noCookieTest = async () => {
  const response = await axios.post(
    process.env.TEST_HOST as string,
    {
      query: meQuery
    }
  )
  // console.log(response)
  // FIXME:
  expect(response.data.data.me).toBeNull()
}

describe("me", () => {
  it("return null if no cookie", async () => {
    await noCookieTest()
  })

  it("get current user", async () => {
    await loginAndQueryMeTest()
  })
})
