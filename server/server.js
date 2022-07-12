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

server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested, Content-Type, Accept Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "POST, PUT, PATCH, GET, DELETE");
    return res.status(200).json({});
  }
  next();
});

server.use(express.json());
server.use(userRouter);
server.use(
  "/graphql",
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

module.exports = server;
