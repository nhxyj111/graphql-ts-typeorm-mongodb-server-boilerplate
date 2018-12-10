// import { createTypeormConn } from '../../utils/createTypeormConn';
// import { Connection } from 'typeorm';
// import { User } from '../../entity/User';
import axios from 'axios';
import { loginAndQueryMeTest } from '../me/me.test';
import { TestClient } from '../../utils/TestClient'
// const email = 'bob0@bob.com'
// const password = '123456'
// let conn: Connection
// beforeAll(async () => {
//   conn = await createTypeormConn()
//   await User.create({
//     email,
//     password,
//     confirmed: true
//   }).save()
// })

// afterAll(async () => {
//   await conn.close()
// })

const logoutMutation = `
  mutation {
    logout
  }
`

const meQuery = `
  {
    me {
      email
    }
  }
`

const email = 'xxx@xxx.com'
const password = '123456'

describe("logout", () => {
  it("multiple sessions", async () => {
    const sess1 = new TestClient(process.env.TEST_HOST as string)
    const sess2 = new TestClient(process.env.TEST_HOST as string)
    await sess1.login(email, password)
    await sess2.login(email, password)
    expect(await sess1.me()).toEqual(await sess2.me())
    await sess1.logout()
    expect(await sess1.me()).toEqual(await sess2.me())
  })

  it("test logging out a user", async () => {
    await loginAndQueryMeTest()
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: logoutMutation
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

    expect(response.data.data.me).toBeNull()
  })
})
