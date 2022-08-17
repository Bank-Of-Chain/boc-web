export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'

export const ETH_DECIMALS = 18

export const LUSD_ADDRESS = '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0'
export const TUSD_ADDRESS = '0x0000000000085d4780B73119b644AE5ecd22b376'
export const USDP_ADDRESS = '0x8E870D67F660D95d5be530380D0eC0bd388289E1'
export const BUSD_ADDRESS = '0x4Fabb145d64652a948d72533023f6E7A623C7C53'
export const USDT_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
export const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
export const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'

const STABLECOINS = [
  {
    id: 'dai',
    symbol: 'DAI',
    address: DAI_ADDRESS
  },
  {
    id: 'usdc',
    symbol: 'USDC',
    address: USDC_ADDRESS
  },
  {
    id: 'usdt',
    symbol: 'USDT',
    address: USDT_ADDRESS
  },
  {
    id: 'busd',
    symbol: 'BUSD',
    address: BUSD_ADDRESS
  },
  {
    id: 'pax-dollar',
    symbol: 'USDP',
    address: USDP_ADDRESS
  },
  {
    id: 'tusd',
    symbol: 'TUSD',
    address: TUSD_ADDRESS
  },
  {
    id: 'lusd',
    symbol: 'LUSD',
    address: LUSD_ADDRESS
  }
]

export default STABLECOINS
