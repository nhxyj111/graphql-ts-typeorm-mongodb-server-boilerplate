/// <reference path="../../../types/schema.d.ts" />
import * as bcrypt from 'bcryptjs'

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from "../../../entity/User";
import { invalidLogin, confirmEmailError, forgotPasswordLockedError } from "./errorMessages";
import { userSessionIdPrefix } from '../../../constants';
// import { redisSessionPrefix } from '../../constants';

// import { sendEmail } from '../../utils/sendEmail';

const errorResponse = [{
  path: 'email',
  message: invalidLogin
}]


export const resolvers: ResolverMap = {
  Mutation: {
    login: async (
      _,
      {email, password}: GQL.ILoginOnMutationArguments,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return errorResponse
      }

      if (!user.confirmed) {
        return [{
          path: 'email',
          message: confirmEmailError
        }]
      }

      if (user.forgotPasswordLocked) {
        return [{
          path: 'email',
          message: forgotPasswordLockedError
        }]
      }

      const valid = await bcrypt.compare(password, user.password)
      if (!valid) {
        return errorResponse
      }

      session.userId = user.id.toString()
      if (req.sessionID) {
        await redis.lpush(`${userSessionIdPrefix}${user.id.toString()}`, req.sessionID)
      }
      // redis.get(`${redisSessionPrefix}${req.sessionID}`)
      return null
    }
  }
}
