window.config = {
  localhost: {
    vault_address: "0x9A8Ec3B44ee760b629e204900c86d67414a67e8f",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://localhost:3000",
    exchange_extra_params: {
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      },
      oneInch: {
        network: 137,
        protocols: 'DFYN,POLYGON_DODO_V2,POLYGON_MSTABLE,POLYGON_SUSHISWAP,POLYGON_QUICKSWAP,POLYGON_CURVE,POLYGON_AAVE_V2'
      }
    }
  },
  dev: {
    vault_address: "0x9A8Ec3B44ee760b629e204900c86d67414a67e8f",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://192.168.60.12/api",
    exchange_extra_params: {
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      },
      oneInch: {
        network: 137,
        protocols: 'DFYN,POLYGON_DODO_V2,POLYGON_MSTABLE,POLYGON_SUSHISWAP,POLYGON_QUICKSWAP,POLYGON_CURVE,POLYGON_AAVE_V2'
      }
    }
  },
  mainnet: {
    vault_address: "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "",
    exchange_extra_params: {
      paraswap: {
        network: 137,
      },
      oneInch: {
        network: 137,
      }
    }
  }
};
