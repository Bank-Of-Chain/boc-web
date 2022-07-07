// === Utils === //
import * as ethers from "ethers";
import isEmpty from "lodash/isEmpty";

const { Contract } = ethers;

const usePriceProvider = (params) => {
  const { userProvider, VAULT_ADDRESS, VAULT_ABI, PRICE_ORCALE_ABI } = params;

  const getPriceProvider = async () => {
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS)) {
      throw new Error("userProvider or VAULT_ADDRESS is empty");
    }
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    return vaultContract.priceProvider().then((priceOracleAddress) => {
      const priceOracleContract = new Contract(
        priceOracleAddress,
        PRICE_ORCALE_ABI,
        userProvider
      );
      return priceOracleContract;
    });
  };

  return {
    getPriceProvider,
  };
};

export default usePriceProvider;
