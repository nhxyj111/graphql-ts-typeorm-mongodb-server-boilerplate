/// <reference path="../../../types/schema.d.ts" />
// import * as bcrypt from 'bcryptjs'
import * as yup from 'yup'

import { ResolverMap } from "../../../types/graphql-utils";
import { User } from '../../../entity/User';
import { formatYupError } from '../../../utils/formatYupError';
import { duplicateEmail, emailNotLongEnough, invalidEmail } from './errorMessages';
import { createConfirmEmailLink } from '../../../utils/createConfirmEmailLink';
import { registerPasswordValidation } from '../../../yupSchemas';
// import { sendEmail } from '../../utils/sendEmail';

const schema = yup.object().shape({
  email: yup.string().min(3, emailNotLongEnough).max(255).email(invalidEmail),
  password: registerPasswordValidation
})

export const resolvers: ResolverMap = {
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments, { redis, url }) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch(err) {
        return formatYupError(err)
      }
      const { email, password } = args;
      const userAlreadyExists = await User.findOne({ where: { email }, select: ['id'] })
      if (userAlreadyExists) {
        return [{
          path: 'email',
          message: duplicateEmail
        }]
      }
      // const hashedPassword = await bcrypt.hash(password, 10)
      const user = User.create({
        email,
        password,
        confirmed: false
      })
      await user.save()

      if (process.env.NODE_ENV !== 'test') {
        const link = await createConfirmEmailLink(url, user.id.toString(), redis)
        console.log(link)
        // await sendEmail(email, link)
      }

      return null
    }
  }
}
