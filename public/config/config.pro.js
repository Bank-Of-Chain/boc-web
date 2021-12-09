/**
 * 生产环境配置文件
 */
 const configBase = {
  vault_address: '',
  underlying_address: '',
  community_url: 'https://discord.gg/GjT2crrv',
  aboutus_url: 'https://piggyfinance.github.io/docs/zh/aboutus/',
  blog_url: 'https://piggyfinance.github.io/docs/zh/blog/',
  licenses_url: 'https://piggyfinance.github.io/docs/zh/licenses/',
  document_url: "https://piggyfinance.github.io/docs/zh/docs/"
}

const config137 = {
  ...configBase,
  apy_server: 'https://bankofchain.io/api/137',
  rpcUrl: 'https://rpc-mainnet.maticvigil.com',
  vault_address: "0xFB7f340A7DEfD3bB0072844db6D5EbdFAD765dea",
  underlying_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  chain_browser_url:'https://polygonscan.com',
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['POLYGON_ONE_INCH_LIMIT_ORDER']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: []
    }
  },
}

const config56 = {
  ...configBase,
  apy_server: 'https://bankofchain.io/api/56',
  rpcUrl: 'https://speedy-nodes-nyc.moralis.io/f2cbcaf720c374313b5543f8/bsc/mainnet/archive',
  vault_address: "",
  underlying_address: "0x55d398326f99059fF775485246999027B3197955",
  chain_browser_url:'https://bscscan.com',
  exchange_extra_params: {
    oneInch: {
      network: 56,
      excludeProtocols: ['BSC_ONE_INCH_LIMIT_ORDER']
    },
    paraswap: {
      network: 56,
      excludeContractMethods: []
    }
  },
}

window.config = {
  // polygon
  137: config137,
  // bsc
  56: config56
};