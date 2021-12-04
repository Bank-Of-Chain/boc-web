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
    },
    chain_browser_url: '',
    community_url: 'https://discord.gg/GjT2crrv',
    aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
    blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
    licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
    document_url: "https://piggyfinance.github.io/docs/zh/docs/"
  },
  // dev
  31337: {
    vault_address: "0x205Cfc23ef26922E116135500abb4B12Ab6d4668",
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
    },
    chain_browser_url: '',
    community_url: 'https://discord.gg/GjT2crrv',
    aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
    blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
    licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
    document_url: "https://piggyfinance.github.io/docs/zh/docs/"
  },
  // polygon
  137: {
    vault_address: "0xFB7f340A7DEfD3bB0072844db6D5EbdFAD765dea",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "//bankofchain.io/api",
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
    },
    chain_browser_url: 'https://polygonscan.com',
    community_url: 'https://discord.gg/GjT2crrv',
    aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
    blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
    licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
    document_url: "https://piggyfinance.github.io/docs/zh/docs/"
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
    },
    chain_browser_url: 'https://rinkeby.etherscan.io',
    community_url: 'https://discord.gg/GjT2crrv',
    aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
    blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
    licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
    document_url: "https://piggyfinance.github.io/docs/zh/docs/"
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
    },
    chain_browser_url: 'https://etherscan.io',
    community_url: 'https://discord.gg/GjT2crrv',
    aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
    blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
    licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
    document_url: "https://piggyfinance.github.io/docs/zh/docs/"
  }
};