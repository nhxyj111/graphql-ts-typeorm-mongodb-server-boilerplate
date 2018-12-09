import * as Redis from 'ioredis'
import fetch from 'node-fetch'
import { Connection } from 'typeorm';

import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConn } from "./createTypeormConn";
import { User } from "../entity/User";

let userId: string;
const redis = new Redis()
let conn: Connection

beforeAll(async () => {
  conn = await createTypeormConn()
  const user = await User.create({
    email: 'bob@bob.com',
    password: '123456',
    confirmed: false
  }).save()
  userId = user.id.toString()
})

afterAll(async () => {
  await conn.close()
})

describe("test createConfirmEmailLink", () => {
  it("Make sure it confirms user and clears key in reids", async () => {
    const url = await createConfirmEmailLink(
      process.env.TEST_HOST as string,
      userId as string,
      redis
    )
    const response = await fetch(url);
    const text = await response.text()
    expect(text).toEqual('ok')
    const user = await User.findOne(userId)
    expect((user as User).confirmed).toBeTruthy()
    const chunks = url.split('/')
    const key = chunks[chunks.length - 1]
    const value = await redis.get(key)
    expect(value).toBeNull()
  })

  // it("sends invalid back if bad id sent", async () => {
  //   const response = await fetch(`${process.env.TEST_HOST}/confirm/12345`);
  //   const text = await response.text()
  //   expect(text).toEqual('invalid')
  // })
})
