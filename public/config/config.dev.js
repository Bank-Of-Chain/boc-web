/**
 * 开发环境配置文件
 */
window.config = {
  // polygon
  137: {
    vault_address: "0xFB7f340A7DEfD3bB0072844db6D5EbdFAD765dea",
    underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    apy_server: "https://bankofchain.io/api",
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
    rpcUrl: "",
    exchange_extra_params: {
      oneInch: {
        network: 4,
        excludeProtocols: []
      },
      paraswap: {
        network: 4,
        excludeContractMethods: []
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
    vault_address: "",
    underlying_address: "",
    apy_server: "",
    rpcUrl: '',
    exchange_extra_params: {
      oneInch: {
        network: 1,
        excludeProtocols: []
      },
      paraswap: {
        network: 1,
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