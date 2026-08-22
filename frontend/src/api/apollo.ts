import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";


let graphqlUrl =
  import.meta.env.VITE_GRAPHQL_URL ??
  "http://localhost:8001/graphql/";

if (!graphqlUrl.endsWith('/')) {
  graphqlUrl += '/';
}


const httpLink = new HttpLink({
  uri: graphqlUrl,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});


export default client;