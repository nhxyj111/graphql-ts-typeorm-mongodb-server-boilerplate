import { Connection } from 'typeorm';
import * as Redis from 'ioredis'
import { TestClient } from '../../utils/TestClient'
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { User } from '../../entity/User';
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount';
import { forgotPasswordLockedError } from '../login/errorMessages';
import { passwordNotLongEnough } from '../register/errorMessages';
import { expiredKeyError } from './errorMessages';
import { createTestConn } from '../../testUtils/createTestConn';

let conn: Connection
const redis = new Redis()
const email = 'xxdddx@ccc.com'
const password = '123456'
const newPassword = 'new123456'
let userId: string;

beforeAll(async () => {
  conn = await createTestConn()
  const user = await User.create({
    email,
    password,
    confirmed: true
  }).save()
  userId = user.id.toString()
})
afterAll(async () => {
  conn.close()
})


describe("forgot password", () => {
  it("--->", async () => {
    const client = new TestClient(process.env.TEST_HOST as string)

    // lock account
    await forgotPasswordLockAccount(userId, redis)
    const url = await createForgotPasswordLink(process.env.TEST_HOST as string, userId, redis)
    const parts = url.split('/')
    const key = parts[parts.length - 1]

    // make sure you can't login to locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [{
          path: 'email',
          message: forgotPasswordLockedError
        }]
      }
    })

    expect(await client.forgotPasswordChange('a', key)).toEqual({
      data: {
        forgotPasswordChange: [{
          path: 'newPassword',
          message: passwordNotLongEnough
        }]
      }
    })

    const response = await client.forgotPasswordChange(newPassword, key)
    expect(response.data).toEqual({
      forgotPasswordChange: null
    })

    expect(await client.forgotPasswordChange('expired-test', key)).toEqual({
      data: {
        forgotPasswordChange: [{
          path: 'key',
          message: expiredKeyError
        }]
      }
    })

    const lr = await client.login(email, newPassword)
    expect(lr).toEqual({
      data: {
        login: null
      }
    })
  })
})
