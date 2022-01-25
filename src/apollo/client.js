import {
  ApolloClient,
  InMemoryCache
} from '@apollo/client';

export const ethClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/naruduo/my-subgraph-eth',
    cache: new InMemoryCache(),
});
  
export const bscClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/naruduo/my-subgraph-bsc',
    cache: new InMemoryCache(),
});
  
export const maticClient = new ApolloClient({
    uri: 'https://api.thegraph.com/subgraphs/name/naruduo/my-subgraph',
    cache: new InMemoryCache(),
});
