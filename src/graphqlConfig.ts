import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";

export const client = new ApolloClient({
  // uri: 'http://18.191.174.180:8100/graphql',
  // uri: 'http://223.194.46.212:8100/graphql',
  uri: 'http://127.0.0.1:8000/graphql',
  cache: new InMemoryCache()
});