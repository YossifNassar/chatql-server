import  { ApolloServer, gql } from 'apollo-server-express';
import fs from 'fs';
import express from 'express';
import { createServer } from 'http';
import resolvers from './resolvers'

const app = express();
const PORT = 8080
const typeDefs = gql(fs.readFileSync(__dirname.concat('/schema.graphql'), 'utf8'))
const server = new ApolloServer({ typeDefs, resolvers, });

server.applyMiddleware({ app, path: '/graphql' });

const httpServer = createServer(app);
server.installSubscriptionHandlers(httpServer);

httpServer.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
});