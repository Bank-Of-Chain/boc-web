/**
 * stage-sg环境配置文件
 */

const ETHI_FOR_ETH = "0x0c626FC4A447b01554518550e30600136864640B";

const USDI_FOR_ETH = "0xa722bdA6968F50778B973Ae2701e90200C564B49";
const USDI_FOR_BSC = "0xc7C037221Cb8Af497A2963e553263aE38e01dA62";
const USDI_FOR_MATIC = "0x04Cd8B3e384e7bBB01109bc8b6708fCAeD5e9eB0";

const ETHI_VAULT = "0x9c65f85425c619A6cB6D29fF8d57ef696323d188";
const USDI_VAULT_FOR_ETH = "0xcD0048A5628B37B8f743cC2FeA18817A29e97270";
const USDI_VAULT_FOR_BSC = "0x2f64734C74e72661C9857059928Ed398593da173";
const USDI_VAULT_FOR_MATIC = "0x12087c013f6269A90F113F8935f51C713a09b173";

const VAULT_BUFFER_FOR_ETHI_ETH = "0xF342E904702b1D021F03f519D6D9614916b03f37";
const VAULT_BUFFER_FOR_USDI_ETH = "0x871ACbEabBaf8Bed65c22ba7132beCFaBf8c27B5";
const VAULT_BUFFER_FOR_USDI_BSC = "0x13398e151530AbDF387d8A1Fa4C3a75EC355Cc4d";
const VAULT_BUFFER_FOR_USDI_MATIC =
  "0xfDFB68F5195DF817824Ee881CF63E94402eEc46A";

const configBase = {
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chain_browser_url: "",
  abi_version: "beta-v1.5",
  community_url: "https://discord.com/channels/910840145039749141",
  telegram_url: "https://t.me/joinchat/mSxXlD_it0QyNzll",
  aboutus_url: "https://piggyfinance.github.io/docs/zh/aboutus/",
  blog_url: "https://piggyfinance.github.io/docs/zh/blog/",
  licenses_url: "https://piggyfinance.github.io/docs/zh/licenses/",
  document_url: "https://docs.bankofchain.io",
  boc_server: "https://service-stage-sg.bankofchain.io",
  rpc_url: {
    1: "https://rpc-stage-sg.bankofchain.io",
    56: "https://rpc-stage-sg.bankofchain.io",
    137: "https://rpc-stage-sg.bankofchain.io",
    31337: "https://rpc-stage-sg.bankofchain.io",
  },
  multiple_of_gas: 2,
  dashboard_url: "https://dashboard-stage-sg.bankofchain.io",
  oracle_additional_slippage: 20,
};

const config137 = {
  ...configBase,
  apy_server: "https://stage-sg-keeper-polygon.bankofchain.io",
  usdt_address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
  usdc_address: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  dai_address: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
  exchange_extra_params: {
    oneInchV4: {
      network: 137,
      excludeProtocols: [
        "POLYGON_ONE_INCH_LIMIT_ORDER",
        "POLYGON_ONE_INCH_LIMIT_ORDER_V2",
      ],
    },
    paraswap: {
      network: 137,
      excludeContractMethods: ["swapOnZeroXv2", "swapOnZeroXv4"],
    },
  },
  // 币安链一个区块2千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 1800 * 10 ** 4,
  chain_id: 137,
  vaults: [
    {
      id: "mutilCoins",
      name: "Vault for USDi",
      path: "#/mutils",
      abi_version: "beta-v1.5.9",
      VAULT_ADDRESS: USDI_VAULT_FOR_MATIC,
      USDI_ADDRESS: USDI_FOR_MATIC,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_MATIC,
      isOpen: true,
    },
    {
      id: "ethi",
      name: "Vault for ETHi",
      description: "这是ethi的池子",
      path: "#/ethi",
      abi_version: "ethi",
      VAULT_ADDRESS: "",
      ETHI_ADDRESS: "",
      VAULT_BUFFER_ADDRESS: "",
      isOpen: true,
    },
  ],
};

const config56 = {
  ...configBase,
  apy_server: "https://stage-sg-keeper-bsc.bankofchain.io",
  usdt_address: "0x55d398326f99059fF775485246999027B3197955",
  usdc_address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d",
  dai_address: "0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3",
  exchange_extra_params: {
    oneInchV4: {
      network: 56,
      excludeProtocols: [
        "BSC_ONE_INCH_LIMIT_ORDER",
        "BSC_ONE_INCH_LIMIT_ORDER_V2",
      ],
    },
    paraswap: {
      network: 56,
      excludeContractMethods: ["swapOnZeroXv2", "swapOnZeroXv4"],
    },
  },
  // 币安链一个区块8千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 7200 * 10 ** 4,
  chain_id: 56,
  vaults: [
    {
      id: "mutilCoins",
      name: "Vault for USDi",
      path: "#/mutils",
      abi_version: "beta-v1.5.9",
      VAULT_ADDRESS: USDI_VAULT_FOR_BSC,
      USDI_ADDRESS: USDI_FOR_BSC,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_BSC,
      isOpen: true,
    },
    {
      id: "ethi",
      name: "Vault for ETHi",
      description: "这是ethi的池子",
      path: "#/ethi",
      abi_version: "ethi",
      VAULT_ADDRESS: "",
      ETHI_ADDRESS: "",
      VAULT_BUFFER_ADDRESS: "",
      isOpen: true,
    },
  ],
};

const config1 = {
  ...configBase,
  apy_server: "https://stage-sg-keeper-eth.bankofchain.io",
  ethi_keeper_server: "https://stage-sg-keeper-ethi.bankofchain.io",
  usdt_address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  usdc_address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
  dai_address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  chain_browser_url: "https://etherscan.io",
  exchange_extra_params: {
    oneInchV4: {
      network: 1,
      protocols:
        "BALANCER,BALANCER_V2,PMMX,UNIFI,SHIBASWAP,CLIPPER,DXSWAP,FIXED_FEE_SWAP,DFX_FINANCE,CONVERGENCE_X,SAKESWAP,CREAM_LENDING,CURVE_V2,CURVE_V2_EURS_2_ASSET,CURVE_V2_EURT_2_ASSET,SETH_WRAPPER,MOONISWAP,SUSHI,COMPOUND,KYBER,CREAMSWAP,AAVE,CURVE,UNISWAP_V1,UNISWAP_V2,CHAI,OASIS,BANCOR,IEARN,SWERVE,VALUELIQUID,DODO,SHELL,BLACKHOLESWAP,PMM1,DEFISWAP,MINISWAP,AAVE_V2,ST_ETH,ONE_INCH_LP,LINKSWAP,S_FINANCE,ONE_INCH_LP_1_1,PSM,POWERINDEX,SMOOTHY_FINANCE,PMM2,PMM3,SADDLE,PMM4,KYBER_DMM,UNISWAP_V3,DEFI_PLAZA,CURVE_V2_ETH_CRV,FIXED_FEE_SWAP_V3,CURVE_V2_ETH_CVX,CURVE_V2_XAUT_2_ASSET,WSTETH,CURVE_V2_SPELL_2_ASSET,CURVE_V2_YFI_2_ASSET,CURVE_V2_THRESHOLDNETWORK_2_ASSET,SYNAPSE,POOLTOGETHER,CURVE_V2_ETH_PAL,ETH_BANCOR_V3",
    },
    paraswap: {
      network: 1,
      excludeDEXS: "0x,0xRFQt,Balancer",
      excludeContractMethods: ["swapOnZeroXv2", "swapOnZeroXv4"],
    },
  },
  // ETH链一个区块3千万，使用90%的空间即可，过大会造成打块过慢
  max_gas_limit: 2700 * 10 ** 4,
  chain_id: 1,
  vaults: [
    {
      id: "mutilCoins",
      name: "Vault for USDi",
      path: "#/mutils",
      abi_version: "beta-v1.5.9",
      VAULT_ADDRESS: USDI_VAULT_FOR_ETH,
      USDI_ADDRESS: USDI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_USDI_ETH,
      isOpen: true,
    },
    {
      id: "ethi",
      name: "Vault for ETHi",
      description: "这是ethi的池子",
      path: "#/ethi",
      abi_version: "ethi",
      VAULT_ADDRESS: ETHI_VAULT,
      ETHI_ADDRESS: ETHI_FOR_ETH,
      VAULT_BUFFER_ADDRESS: VAULT_BUFFER_FOR_ETHI_ETH,
      isOpen: true,
    },
  ],
};

export default {
  // 本地链
  31337: config1,
  // polygon
  137: config137,
  // bsc
  56: config56,
  // eth
  1: config1,
  // 无链信息时的加载
  [undefined]: configBase,
};
