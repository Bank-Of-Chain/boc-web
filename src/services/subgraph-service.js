import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import genConfig from '@/config/config'
import get from 'lodash/get'
import isNil from 'lodash/isNil'

const ENV_NETWORK_TYPE = get(process, 'env.REACT_APP_NETWORK_TYPE', localStorage.REACT_APP_NETWORK_TYPE)
const config = genConfig[ENV_NETWORK_TYPE] || genConfig[undefined]
const { env, chain_id } = config

const isPr02Sg = () => {
  return env === 'pr02-sg'
}

const isDevLocal = () => {
  return env === 'local'
}

const getSubgraphForEthUsdi = () => {
  if (isDevLocal()) return 'http://localhost:8000'
  if (isPr02Sg()) return 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-ethereum'
  return `https://${env}-subgraph.bankofchain.io/subgraphs/name/boc-v1_5/subgraph-eth`
}

const getSubgraphForMaticUsdi = () => {
  if (isDevLocal()) return 'http://localhost:8000'
  if (isPr02Sg()) return ''
  return `https://${env}-subgraph.bankofchain.io/subgraphs/name/boc-v1_5/subgraph-eth`
}

const getSubgraphForEthEthi = () => {
  if (isDevLocal()) return 'http://localhost:8000'
  if (isPr02Sg()) return 'https://api.thegraph.com/subgraphs/name/bankofchain/boc-ethi'
  return `https://${env}-subgraph.bankofchain.io/subgraphs/name/boc-v1_5/subgraph-ethi`
}

const QUERY = `query ($vaultAddress: Bytes) {
  vault(id: $vaultAddress) {
    totalAssets
  }
}`

export const getPegTokenDetail = (type, vaultAddress) => {
  const client = {
    USDi: {
      1: new ApolloClient({
        uri: getSubgraphForEthUsdi(),
        cache: new InMemoryCache()
      }),
      137: new ApolloClient({
        uri: getSubgraphForMaticUsdi(),
        cache: new InMemoryCache()
      })
    },
    ETHi: {
      1: new ApolloClient({
        uri: getSubgraphForEthEthi(),
        cache: new InMemoryCache()
      })
    }
  }

  const targetClient = get(client, `${type}.${chain_id}`)
  if (isNil(chain_id) || isNil(targetClient)) return Promise.resolve()

  return targetClient
    .query({
      query: gql(QUERY),
      variables: {
        vaultAddress: vaultAddress.toLowerCase()
      }
    })
    .then(res => res.data)
}
