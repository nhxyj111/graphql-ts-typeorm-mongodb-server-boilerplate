import { request } from 'graphql-request'
import { invalidLogin, confirmEmailError } from './errorMessages';
import { User } from '../../entity/User';
import { createTestConn } from '../../testUtils/createTestConn';

const email = 'ddddd6dd@ddd.com'
const password = '123456'

const registerMutation = (e: string, p: string) => `
  mutation {
    register(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`
const loginMutation = (e: string, p: string) => `
  mutation {
    login(email: "${e}", password: "${p}") {
      path
      message
    }
  }
`

beforeAll(async () => {
  await createTestConn()
})

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const response = await request(process.env.TEST_HOST as string, loginMutation(e, p))
  expect(response).toEqual({
    login: [{
      path: 'email',
      message: errMsg
    }]
  })
}

describe("login", () => {
  it("email not found", async () => {
    await loginExpectError('not@found.com', '123456', invalidLogin)
  })

  it("email not confirmed", async () => {
    await request(process.env.TEST_HOST as string, registerMutation(email, password))
    await loginExpectError(email, password, confirmEmailError)

    await User.update({ email }, { confirmed: true })
    await loginExpectError(email, 'invalid#pwd', invalidLogin)

    const response = await request(process.env.TEST_HOST as string, loginMutation(email, password))
    expect(response).toEqual({ login: null })
  })
})

