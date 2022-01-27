import {
    ApolloClient,
    InMemoryCache
} from '@apollo/client';
import {
    SUB_GRAPH_URL
} from './../constants';
import {
    ETH,
    BSC,
    MATIC
} from './../constants/chains';

export const ethClient = new ApolloClient({
    uri: SUB_GRAPH_URL[ETH.id],
    cache: new InMemoryCache(),
});

export const bscClient = new ApolloClient({
    uri: SUB_GRAPH_URL[BSC.id],
    cache: new InMemoryCache(),
});

export const maticClient = new ApolloClient({
    uri: SUB_GRAPH_URL[MATIC.id],
    cache: new InMemoryCache(),
});