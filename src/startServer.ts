import { GraphQLServer } from 'graphql-yoga'
import { importSchema } from 'graphql-import'
import * as path from 'path'
import * as fs from 'fs'
import { mergeSchemas, makeExecutableSchema} from 'graphql-tools'

import { createTypeormConn } from "./utils/createTypeormConn";
import { GraphQLSchema } from 'graphql';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = []
  const folders = fs.readdirSync(path.join(__dirname, './modules'))
  folders.forEach(folder => {
    const { resolvers } = require(`./modules/${folder}/resolvers`)
    const typeDefs = importSchema(path.join(__dirname, `./modules/${folder}/schema.graphql`))
    schemas.push(makeExecutableSchema({
      resolvers,
      typeDefs
    }))
  })
  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) })
  await createTypeormConn()
  const port = process.env.NODE_ENV === 'test' ? 8888 : 4000
  const app = await server.start({ port })
  console.log(`Server is running on localhost:${port}`)
  return app
}
