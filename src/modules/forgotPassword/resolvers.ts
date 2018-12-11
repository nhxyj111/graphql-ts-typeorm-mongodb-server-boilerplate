/// <reference path="../../types/schema.d.ts" />
import * as yup from 'yup'
import * as bcrypt from 'bcryptjs'

import { ResolverMap } from "../../types/graphql-utils";
// import { redis } from "../../redis";
// import { userSessionIdPrefix, redisSessionPrefix } from "../../constants";
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import { User } from "../../entity/User";
import { userNotFoundError, expiredKeyError } from "./errorMessages";
import { forgotPasswordPrefix } from "../../constants";
import { registerPasswordValidation } from '../../yupSchemas';
import { formatYupError } from '../../utils/formatYupError';

const schema = yup.object().shape({
  newPassword: registerPasswordValidation
})

export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => 'dummy2'
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: GQL.ISendForgotPasswordEmailOnMutationArguments,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } })
      if (!user) {
        return [{
          path: 'email',
          message: userNotFoundError
        }]
      }

      await forgotPasswordLockAccount(user.id.toString(), redis)
      // TODO:
      const url = await createForgotPasswordLink("", user.id.toString(), redis)
      console.log("Create-Forgot-Password-Link > ", url)
      return true
    },
    forgotPasswordChange: async (
      _,
      { newPassword, key }: GQL.IForgotPasswordChangeOnMutationArguments,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`
      const userId = await redis.get(redisKey)
      if (!userId) {
        return [{
          path: 'key',
          message: expiredKeyError
        }]
      }
      try {
        await schema.validate({ newPassword }, { abortEarly: false })
      } catch (err) {
        return formatYupError(err)
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10)
      const updatePromise = User.update(userId, {
        password: hashedPassword,
        forgotPasswordLocked: false
      })
      const deleteKeyPromise = redis.del(redisKey)
      await Promise.all([
        updatePromise,
        deleteKeyPromise
      ])
      return null
    }
  }
}
