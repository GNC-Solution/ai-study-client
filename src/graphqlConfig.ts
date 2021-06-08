import {
  ApolloClient,
  InMemoryCache,
} from "@apollo/client";

export const client = new ApolloClient({
  uri: 'http://18.191.174.180:8100/graphql',
  cache: new InMemoryCache()
});