import { GraphQLServer } from 'graphql-yoga'

import { createTypeormConn } from "./utils/createTypeormConn";
import { redis } from './redis'
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';

export const startServer = async () => {

  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({ redis, url: request.protocol + '://' + request.get('host') })
  })

  server.express.get('/confirm/:id', confirmEmail)

  await createTypeormConn()
  const port = process.env.NODE_ENV === 'test' ? 8888 : 4000
  const app = await server.start({ port })
  console.log(`Server is running on localhost:${port}`)
  return app
}
