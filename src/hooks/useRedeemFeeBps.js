/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { message } from "antd";

// === Utils === //
import * as ethers from "ethers";
import isEmpty from "lodash/isEmpty";
import isInteger from "lodash/isInteger";

const { Contract, BigNumber } = ethers;

const useRedeemFeeBps = (props) => {
  const { userProvider, VAULT_ADDRESS, VAULT_ABI } = props;
  const [value, setValue] = useState(BigNumber.from(0));
  const [error, setError] = useState();
  const [loading, setLoading] = useState(false);

  const reload = () => {
    setLoading(true);
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract
      .redeemFeeBps()
      .then(setValue)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  const set = (nextValue) => {
    if (nextValue < 0 || nextValue > 10000 || !isInteger(nextValue)) {
      message.warning("请输入正确的值");
      return;
    }
    const callback = message.loading("数据提交中...", 0);
    const vaultContract = new Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    vaultContract
      .connect(signer)
      .setRedeemFeeBps(nextValue)
      .then((tx) => tx.wait())
      .then(reload)
      .catch((error) => {
        if (error.code === 4001) return;
        message.error(error.data.message);
      })
      .finally(callback);
  };

  useEffect(() => {
    if (isEmpty(userProvider) || isEmpty(VAULT_ADDRESS)) {
      setLoading(false);
      setError();
      return;
    }
    reload();
  }, [userProvider, VAULT_ADDRESS]);

  return {
    value,
    loading,
    error,
    reload,
    set,
  };
};

export default useRedeemFeeBps;
