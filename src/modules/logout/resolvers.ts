/// <reference path="../../types/schema.d.ts" />

import { ResolverMap } from "../../types/graphql-utils";
import { redis } from "../../redis";
import { userSessionIdPrefix, redisSessionPrefix } from "../../constants";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy'
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        const sessionIds = await redis.lrange(`${userSessionIdPrefix}${userId}`, 0, -1)
        const promises = []
        for (let i = 0; i < sessionIds.length; i++) {
          promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`))
        }
        await Promise.all(promises)
        return true
      }
      return false
    }
  }
}

// new Promise(res => session.destroy(err => {
//   if (err) {
//     console.log('logout error:', err)
//   }
//   res(true)
// }))
