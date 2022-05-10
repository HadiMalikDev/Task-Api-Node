require('dotenv').config({path:'server/.env'})
console.log(process.env.USER)
const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { loadSchemaSync } = require('@graphql-tools/load');
const { GraphQLFileLoader } = require('@graphql-tools/graphql-file-loader');
const graphqlResolver = require('./graphql/resolvers/index');

const server = express();
const PORT = process.env.PORT || 5000;

const schema = makeExecutableSchema({
  typeDefs: loadSchemaSync('server/graphql/schemas/*.graphql', {
    loaders: [new GraphQLFileLoader()],
  }),
  resolvers: graphqlResolver,
});

server.use(
  '/graphql',
  graphqlHTTP({
    schema,
    graphiql: true,
  })
);

server.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));