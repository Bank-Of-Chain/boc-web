/**
 * {{env}}环境配置文件
 */

const ETHI_FOR_ETH = "{{ETHI_FOR_ETH}}";

const USDI_FOR_ETH = "{{USDI_FOR_ETH}}";
const USDI_FOR_BSC = "{{USDI_FOR_BSC}}";
const USDI_FOR_MATIC = "{{USDI_FOR_MATIC}}";

const ETHI_VAULT = "{{ETHI_VAULT}}";
const USDI_VAULT_FOR_ETH = "{{USDI_VAULT_FOR_ETH}}";
const USDI_VAULT_FOR_BSC = "{{USDI_VAULT_FOR_BSC}}";
const USDI_VAULT_FOR_MATIC = "{{USDI_VAULT_FOR_MATIC}}";

const VAULT_BUFFER_FOR_ETHI_ETH = "{{VAULT_BUFFER_FOR_ETHI_ETH}}";
const VAULT_BUFFER_FOR_USDI_ETH = "{{VAULT_BUFFER_FOR_USDI_ETH}}";
const VAULT_BUFFER_FOR_USDI_BSC = "{{VAULT_BUFFER_FOR_USDI_BSC}}";
const VAULT_BUFFER_FOR_USDI_MATIC = "{{VAULT_BUFFER_FOR_USDI_MATIC}}";

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
  boc_server: "{{{API_SERVER}}}",
  rpc_url: {
    1: "{{{RPC_FOR_1}}}",
    56: "{{{RPC_FOR_56}}}",
    137: "{{{RPC_FOR_137}}}",
    31337: "{{{RPC_FOR_31337}}}",
  },
  multiple_of_gas: 2,
  dashboard_url: "{{{DASHBOARD_ROOT}}}",
  oracle_additional_slippage: 20,
};

const config137 = {
  ...configBase,
  apy_server: "{{{KEEPER_FOR_MATIC_USDI}}}",
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
  apy_server: "{{{KEEPER_FOR_BSC_USDI}}}",
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
  apy_server: "{{{KEEPER_FOR_ETH_USDI}}}",
  ethi_keeper_server: "{{{KEEPER_FOR_ETH_ETHI}}}",
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

const glo = {
  configBase,
  config137,
  config56,
  config1,
};
export default {
  // 本地链
  31337: glo["{{LOCAL_CHAIN_CONFIG}}"],
  // polygon
  137: config137,
  // bsc
  56: config56,
  // eth
  1: config1,
  // 无链信息时的加载
  [undefined]: configBase,
};
