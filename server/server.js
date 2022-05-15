const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { makeExecutableSchema } = require("@graphql-tools/schema");
const { loadSchemaSync } = require("@graphql-tools/load");
const { GraphQLFileLoader } = require("@graphql-tools/graphql-file-loader");
const graphqlResolver = require("./graphql/resolvers/index");
const userRouter = require("./routers/user");

const server = express();
const schema = makeExecutableSchema({
  typeDefs: loadSchemaSync("server/graphql/schemas/*.graphql", {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: graphqlResolver,
});
server.use(express.json())
server.use(userRouter)
server.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

module.exports = server;
