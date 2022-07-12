import * as ethers from "ethers";
import store from "../store";
import { warmDialog } from "../reducers/meta-reducer";
import { WALLETS } from "../constants/wallet";
import { ETH_ADDRESS } from "../constants/token";
import { IERC20_ABI } from "../constants";

export const getWalletName = (web3Modal, userProvider) => {
  if (!userProvider) {
    return "";
  }
  const cacheProvider = web3Modal?.providerController?.cachedProvider;
  if (!cacheProvider) {
    return "";
  }
  if (cacheProvider === "injected") {
    return web3Modal?.providerController?.injectedProvider?.name?.toLowerCase();
  }
  return cacheProvider.toLowerCase();
};

export const addToken = async (tokenAddress, symbol, decimals) => {
  if (tokenAddress === ETH_ADDRESS) {
    return;
  }
  const { web3Modal, userProvider } = store.getState().walletReducer;
  if (!web3Modal || !userProvider) {
    console.log("wallet does not connect");
    return;
  }
  const walletName = getWalletName(web3Modal, userProvider);
  try {
    const supportAdd = [WALLETS.MetaMask.info.symbol];
    if (!supportAdd.includes(walletName)) {
      store.dispatch(
        warmDialog({
          open: true,
          type: "warning",
          message: `The current wallet does not support adding token (address: ${tokenAddress}). You can add token manually.`,
        })
      );
      return;
    }
    const tokenContract = new ethers.Contract(
      tokenAddress,
      IERC20_ABI,
      userProvider
    );
    window.ethereum.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: tokenAddress,
          symbol: symbol || (await tokenContract.symbol()),
          decimals: decimals || (await tokenContract.decimals()),
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};
