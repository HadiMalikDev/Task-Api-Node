// const polyfill = require("cross-fetch/polyfill");
// const { ApolloClient, gql } = require("apollo-boost");
// const client = require("../utils/apollo");
// const server = require("../../server");
// const supertest = require("supertest");
// const request = supertest(server);
// describe("Test getTasks Mutation", () => {
//   let token;
//   beforeAll(async () => {
//     const response = await request.post("/users/login").send({
//       name: "AAA",
//       email: "uniquerrr@gmail.com",
//       password: "Hadi12345",
//     });
//     token = response.body.token;
//   });

//   test("Test", async () => {
//     const getTasks = gql(`
//       query{
//           tasks(token:"${token}"){
//             __typename
//             ... on Tasks{
//               tasks{
//                 title
//               }
//             }
//             ... on AuthenticationFailed{
//               message
//             }
//           }
//         }
//       `);
//     await client.query({ query: getTasks });
//   });
// });
