import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  split
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

let graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ??
  "http://localhost:8001/graphql/";

if (!graphqlUrl.endsWith('/')) {
  graphqlUrl += '/';
}

const httpLink = new HttpLink({
  uri: graphqlUrl,
});

// Configurar WebSocket URL (cambia http:// a ws://)
const wsUrl = graphqlUrl.replace(/^http/, 'ws');

const wsLink = new GraphQLWsLink(createClient({
  url: wsUrl,
  connectionParams: () => {
    const token = localStorage.getItem("token");
    return {
      headers: {
        authorization: token ? `Bearer ${token}` : "",
      }
    };
  }
}));

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

// Usar split para enrutar según el tipo de operación
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink, // Si es subscription, usa WS
  authLink.concat(httpLink), // Si es mutation/query, usa HTTP
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
});

export default client;