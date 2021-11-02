window.config = {
  localhost: {
    vault_address: "0xB03BE3E9D96c1Ba71d6ed26F62966dAAca288b45",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://localhost:3000",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excluedeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      }
    }
  },
  dev: {
    vault_address: "0xB03BE3E9D96c1Ba71d6ed26F62966dAAca288b45",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://192.168.60.12/api",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excluedeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      }
    }
  },
  matic: {
    vault_address: "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://47.243.164.64/api",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excluedeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: []
      }
    }
  }
};
