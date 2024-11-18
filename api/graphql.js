const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const bodyParser = require("body-parser");
const cors = require("cors");

const { USERS } = require("../user"); // Adjust the path if necessary
const { TODOS } = require("../todo"); // Adjust the path if necessary

async function createServer() {
  const app = express();

  const server = new ApolloServer({
    typeDefs: `
        type User {
            id: ID!
            name: String!
            username: String!
            email: String!
            phone: String!
            website: String!
        }

        type Todo {
            id: ID!
            title: String!
            completed: Boolean
            user: User
        }

        type Query {
            getTodos: [Todo]
            getAllUsers: [User]
            getUser(id: ID!): User
        }
    `,
    resolvers: {
      Todo: {
        user: (todo) => USERS.find((e) => e.id === todo.id),
      },
      Query: {
        getTodos: () => TODOS,
        getAllUsers: () => USERS,
        getUser: async (parent, { id }) => USERS.find((e) => e.id === id),
      },
    },
  });

  await server.start();

  app.use(bodyParser.json());
  app.use(cors());
  app.use("/graphql", expressMiddleware(server));

  return app;
}

// Export as a Vercel serverless function
module.exports = async (req, res) => {
  const app = await createServer();
  app(req, res); // Let Express handle the request
};
