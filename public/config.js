window.config = {
  // localhost
  99999: {
    vault_address: "0x1f9c84B161b2c7FFB540BC5354543108cCE37df1",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://192.168.60.6:3000",
    rpcUrl: "http://192.168.60.6:8545",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      }
    }
  },
  // dev
  31337: {
    vault_address: "0xB03BE3E9D96c1Ba71d6ed26F62966dAAca288b45",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://192.168.60.12/api",
    rpcUrl: "http://192.168.60.12:8545",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      }
    }
  },
  // polygon
  137: {
    vault_address: "0xB03BE3E9D96c1Ba71d6ed26F62966dAAca288b45",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "http://47.243.164.64/api",
    rpcUrl: "https://rpc-mainnet.maticvigil.com",
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: []
      }
    }
  },
  4: {
    vault_address: "",
    underlying_address: "",
    apy_server: "",
    rpcUrl: "https://eth-rinkeby.alchemyapi.io/v2/RbuvkoqtcsoGKG0__pVEKQWjh8cLNyV1",
    exchange_extra_params: {
      oneInch: {
        network: 4,
        excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 4,
        excludeContractMethods: ['swapOnZeroXv2', 'swapOnZeroXv4', 'swapOnUniswap', 'swapOnUniswapFork']
      }
    }
  },
  // eth
  1: {
    vault_address: "0xB0D4afd8879eD9F52b28595d31B441D079B2Ca07",
    underlying_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    apy_server: "http://47.243.164.64/api",
    rpcUrl: 'https://mainnet.infura.io/v3/3be290dd5c1a46f894bdf28625c000ce',
    exchange_extra_params: {
      oneInch: {
        network: 137,
        excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
      },
      paraswap: {
        network: 137,
        excludeContractMethods: []
      }
    }
  }
};