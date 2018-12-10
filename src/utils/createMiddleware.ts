import { Resolver, GraphQLMiddlewareFunc } from "../types/graphql-utils";

export const createMiddleware = (middlewareFunc: GraphQLMiddlewareFunc, resolverFunc: Resolver) => (
  parent: any,
  args: any,
  context: any,
  info: any
) => {
  console.log('createMiddleware!')
  console.log(middlewareFunc, resolverFunc)
  return middlewareFunc(resolverFunc, parent, args, context, info)
}
