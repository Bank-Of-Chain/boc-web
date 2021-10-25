/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Row, Col, Tag, Button, Card, InputNumber, Popconfirm, message } from "antd";
import * as ethers from "ethers";
import { BigNumber } from 'ethers';

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, IERC20_ABI, USDT_ADDRESS, EXCHANGE_AGGREGATOR_ABI, EXCHANGE_EXTRA_PARAMS } from "./../../constants";

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils";
import { toFixed } from "./../../helpers/number-format";
import map from "lodash/map";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";

const slipper = 60;

const getExchangePlatformAdapters = async (exchangeAggregator) => {
  const adapters = await exchangeAggregator.getExchangeAdapters();
  const exchangePlatformAdapters = {};
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i];
  }
  return exchangePlatformAdapters;
}

export default function Transaction(props) {
  const { name, from, address, userProvider } = props;
  const [fromValue, setFromValue] = useState(0);
  const [toValue, setToValue] = useState(0);
  const [usdtDecimals] = useState(BigNumber.from(1e6));

  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1));

  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(1));

  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance;
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(from, IERC20_ABI, userProvider);
    usdtContract.balanceOf(address).then(setFromBalance);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.balanceOf(address).then(setToBalance);
    vaultContract.pricePerShare().then(setPerFullShare);
    vaultContract.decimals().then(setUnderlyingUnit);
  };

  const diposit = async () => {
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(from, IERC20_ABI, userProvider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const usdtContractWithUser = usdtContract.connect(signer);
    const nVaultWithUser = vaultContract.connect(signer);
    let nextValue = BigNumber.from(fromValue * usdtDecimals);
    try {
      // 获取当前允许的额度
      const allowanceAmount = await usdtContractWithUser.allowance(address, VAULT_ADDRESS);
      // 如果充值金额大于允许的额度，则需要重新设置额度
      if (nextValue.gt(allowanceAmount)) {
        // 如果允许的额度为0，则直接设置新的额度。否则，则设置为0后，再设置新的额度。
        if (allowanceAmount.gt(0)) {
          const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0);
          await firstApproveTx.wait();
        }
        console.log('当前授权：', allowanceAmount.toString(), '准备授权：', nextValue.toString());
        const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue);
        await secondApproveTx.wait();
      }
      const depositTx = await nVaultWithUser.deposit(nextValue);
      await depositTx.wait();
      setFromValue(0);
      message.loading('数据提交中...', 2.5).then(() => message.success('数据提交成功', 2.5))
    } catch (error) {
      console.log('error=', error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          message.error('服务已关停，请稍后再试！');
        }
      }
    }
  };

  const withdraw = async () => {
    const signer = userProvider.getSigner();
    const nextValue = `${toValue * 1e6}`;
    try {
      const close = message.loading('数据提交中...', 2.5)
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      const vaultContractWithSigner = vaultContract.connect(signer)
      const [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(nextValue, false, []);

      const exchangeManager = await vaultContract.exchangeManager();
      const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
      // 查询兑换路径
      const exchangeArray = await Promise.all(
        map(tokens, async (tokenItem, index) => {
          const exchangeAmounts = amounts[index].toString();
          if (tokenItem === USDT_ADDRESS || exchangeAmounts === '0') {
            return undefined
          }
          const fromConstrat = new ethers.Contract(tokenItem, IERC20_ABI, userProvider)
          const fromToken = {
            decimals: parseInt((await fromConstrat.decimals()).toString()),
            symbol: await fromConstrat.symbol(),
            address: tokenItem
          }
          return {
            fromToken: tokenItem,
            toToken: USDT_ADDRESS,
            fromAmount: exchangeAmounts,
            exchangeParam: await getBestSwapInfo(
              fromToken,
              {
                decimals: 6,
                symbol: 'USDT',
                address: USDT_ADDRESS
              },
              amounts[index].toString(),
              slipper,
              exchangePlatformAdapters,
              EXCHANGE_EXTRA_PARAMS
            )
          }
        })
      )
      const tx = await vaultContractWithSigner.withdraw(nextValue, true, filter(exchangeArray, i => !isEmpty(i)));
      await tx.wait(1);
      setToValue(0);
      close();
      message.success('数据提交成功', 2.5)
    } catch (error) {
      console.error(error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          message.error('服务已关停，请稍后再试！');
        }
      }
    }
  };

  const setFromValuePercent = percent => {
    setFromValue(parseFloat(toFixed(fromBalance, usdtDecimals)) * percent);
  };

  const setToValuePercent = percent => {
    setToValue(parseFloat(toFixed(toBalance, usdtDecimals)) * percent);
  };

  useEffect(() => {
    loadBanlance();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.on('Deposit', (a, b, c) => {
      c && c.getTransaction().then(tx => tx.wait()).then(loadBanlance);
    });
    vaultContract.on('Withdraw', (a, b, c, d, e) => {
      e && e.getTransaction().then(tx => tx.wait()).then(loadBanlance);
      
    });
    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
  }, [address]);

  return (
    <Row>
      <Col span={24}>
        <Card
          title={<span style={{ textAlign: "left", fontSize: 32 }}>{name}</span>}
          bordered
        >
          <Row>
            <Col span={12}>
              <Row gutter={[10, 10]} justify="start">
                <Col span={24} style={{ fontSize: 30, fontWeight: 'bold' }}>余额：{toFixed(fromBalance, usdtDecimals)}</Col>
                <Col span={24}>
                  <Tag color="geekblue" onClick={() => setFromValuePercent(0.25)}>
                    25%
                  </Tag>
                  <Tag color="green" onClick={() => setFromValuePercent(0.5)}>
                    50%
                  </Tag>
                  <Tag color="orange" onClick={() => setFromValuePercent(0.75)}>
                    75%
                  </Tag>
                  <Tag color="magenta" onClick={() => setFromValuePercent(1)}>
                    100%
                  </Tag>
                </Col>
                <Col span={24}>
                  <InputNumber
                    disabled={fromBalance.lt(0)}
                    style={{ width: 200 }}
                    value={fromValue}
                    min={0}
                    max={fromBalance.div(usdtDecimals)}
                    onChange={value => setFromValue(value || 0)}
                  />
                </Col>
                <Col span={24}>
                  <Popconfirm
                    placement="topLeft"
                    title={`确认存入${fromValue && fromValue.toString()}枚USDT吗？`}
                    onConfirm={diposit}
                    okText="是"
                    cancelText="否"
                  >
                    <Button type="primary" disabled={parseFloat(fromValue) <= 0}>
                      转入
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={[10, 10]}>
                <Col span={24} style={{ fontSize: 30, fontWeight: 'bold' }}>
                  <span>份额：{toFixed(toBalance, 10 ** underlyingUnit)}</span>
                  <span>({toFixed(toBalance.mul(perFullShare).div(10 ** underlyingUnit), 10 ** underlyingUnit)}USDT)</span>
                </Col>
                <Col span={24}>
                  <Tag color="geekblue" onClick={() => setToValuePercent(0.25)}>
                    25%
                  </Tag>
                  <Tag color="green" onClick={() => setToValuePercent(0.5)}>
                    50%
                  </Tag>
                  <Tag color="orange" onClick={() => setToValuePercent(0.75)}>
                    75%
                  </Tag>
                  <Tag color="magenta" onClick={() => setToValuePercent(1)}>
                    100%
                  </Tag>
                </Col>
                <Col span={24}>
                  <InputNumber
                    disabled={toBalance.lt(0)}
                    style={{ width: 200 }}
                    value={toValue}
                    min={0}
                    max={toBalance / underlyingUnit}
                    onChange={value => setToValue(value || 0)}
                  />
                </Col>
                <Col span={24}>
                  <Popconfirm
                    placement="topLeft"
                    title={`确认售出${toValue && toValue.toString()}份购入合约吗？`}
                    onConfirm={withdraw}
                    okText="是"
                    cancelText="否"
                  >
                    <Button type="primary" disabled={parseFloat(toValue) <= 0}>
                      转出
                    </Button>
                  </Popconfirm>
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
