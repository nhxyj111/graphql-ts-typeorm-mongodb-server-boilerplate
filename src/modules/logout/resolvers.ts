/// <reference path="../../types/schema.d.ts" />

import { ResolverMap } from "../../types/graphql-utils";
import { redis } from "../../redis";
import { removeAllUsersSessions } from "../../utils/removeAllUsersSessions";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => 'dummy'
  },
  Mutation: {
    logout: async (_, __, { session }) => {
      const { userId } = session;
      if (userId) {
        await removeAllUsersSessions(userId, redis)
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
