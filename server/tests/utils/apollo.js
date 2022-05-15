const { ApolloLink, InMemoryCache, HttpLink } = require("apollo-boost");
const fetch = require("cross-fetch");
const ApolloClient = require("apollo-boost").ApolloClient;

const httpLink = new HttpLink({
  uri: "http://localhost:5000/graphql",
  fetch: fetch,
});

const client = new ApolloClient({
  uri: "http://localhost:5000/graphql",
  link: httpLink,
  cache: new InMemoryCache(),
});

module.exports = client;
