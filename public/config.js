window.config = {
  localhost: {
    vault_address: "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",
    underlying_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    apy_server: "http://localhost:3000",
    exchange_extra_params: {
      paraswap: {
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      },
      oneInch: {}
    }
  },
  dev: {
    vault_address: "0x202CCe504e04bEd6fC0521238dDf04Bc9E8E15aB",
    underlying_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    apy_server: "http://192.168.254.27/api",
    exchange_extra_params: {
      paraswap: {
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      },
      oneInch: {}
    }
  },
  mainnet: {
    vault_address: "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07",
    underlying_address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
    apy_server: "",
    exchange_extra_params: {}
  }
};