const express = require('express');
const path = require('path');
const db = require('./config/connection');
const routes = require('./routes');
const { typeDefs, resolvers } = require('./schemas');
const { ApolloServer } = require('@apollo/server');
const { authMiddleware } = require("./utils/auth");
const { expressMiddleware } = require('@apollo/server/express4');

const app = express();
const PORT = process.env.PORT || 3001;

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
  persistedQueries: false, 
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
};

// create a new instance of Apollo Server using GraphQL schema
const startApolloServer = async (typeDefs, resolvers) => {
  await server.start();
  app.use('/graphql', expressMiddleware(server));
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
    });
  });
};
startApolloServer(typeDefs, resolvers);