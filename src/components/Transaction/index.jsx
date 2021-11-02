/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Row, Col, Tag, Button, Card, InputNumber, Popconfirm, message, Statistic, Tooltip, Switch } from "antd";
import * as ethers from "ethers";
import { BigNumber } from 'ethers';

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, IERC20_ABI, USDT_ADDRESS, EXCHANGE_AGGREGATOR_ABI, EXCHANGE_EXTRA_PARAMS, APY_SERVER } from "./../../constants";

// === Utils === //
import { getBestSwapInfo } from "piggy-finance-utils";
import { toFixed } from "./../../helpers/number-format";
import map from "lodash/map";
import get from "lodash/get";
import isEmpty from "lodash/isEmpty";
import filter from "lodash/filter";
import request from "request";

const { Countdown } = Statistic;
const slipper = 100;

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

  const [lastDepositTimes, setLastDepositTimes] = useState(BigNumber.from(0));
  const [withdrawFee, setWithdrawFee] = useState(BigNumber.from(0));
  const [currentBlockTimestamp, setCurrentBlockTimestamp] = useState(0);
  const [vaultApy, setVaultApy] = useState(BigNumber.from(0));

  const [allowMaxLoss, setAllowMaxLoss] = useState(100);
  const [shouldExchange, setShouldExchange] = useState(true);

  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance;
    setWithdrawLoading(true);
    setDepositLoading(true);
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(from, IERC20_ABI, userProvider);
    usdtContract.balanceOf(address).then((value) => {
      setTimeout(() => {
        setFromBalance(value);
        setDepositLoading(false);
      }, 1000);
    });
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.balanceOf(address).then((value) => {
      setTimeout(() => {
        setToBalance(value);
        setWithdrawLoading(false);
      }, 1000);
    });
    vaultContract.pricePerShare().then(setPerFullShare);
    vaultContract.decimals().then(setUnderlyingUnit);

    vaultContract.userInfos(address).then(setLastDepositTimes);
    vaultContract.calculateWithdrawFeePercent(address).then(setWithdrawFee);

    userProvider.getBlock(userProvider.blockNumber).then(resp => {
      setCurrentBlockTimestamp(resp.timestamp);
    })
  };

  const loadApy = () => {
    const days = 3;
    request.get(`${APY_SERVER}/v3/vault/apy/${days}`, (error, response, body) => {
      console.log('error, response, bod=', error, response, body);
      if (error) {
        return
      }
      setVaultApy(BigNumber.from(get(response, 'data.apy', 0)));
    });
  }

  const diposit = async () => {
    setDepositLoading(true);
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
      message.success('数据提交成功');
    } catch (error) {
      console.log('error=', error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          message.error('服务已关停，请稍后再试！');
        }
      }
    }
    setTimeout(() => {
      setDepositLoading(false);
      setFromValue(0);
    }, 1000);
  };

  const withdraw = async () => {
    setWithdrawLoading(true);
    const signer = userProvider.getSigner();
    const nextValue = `${toValue * 1e6}`;
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      const vaultContractWithSigner = vaultContract.connect(signer)
      let exchangeArray = []
      // 如果不需要兑换则按照多币返回
      if (shouldExchange) {
        const [tokens, amounts] = await vaultContractWithSigner.callStatic.withdraw(nextValue, allowMaxLoss, false, []);
        console.log('tokens, amounts=', tokens, amounts);
        const exchangeManager = await vaultContract.exchangeManager();
        const exchangeManagerContract = new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
        const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
        // 查询兑换路径
        exchangeArray = await Promise.all(
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
            try {
              const bestSwapInfo = await getBestSwapInfo(
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
              return {
                fromToken: tokenItem,
                toToken: USDT_ADDRESS,
                fromAmount: exchangeAmounts,
                exchangeParam: bestSwapInfo
              }
            } catch (error) {
              return
            }
          })
        )
      }
      const nextArray = filter(exchangeArray, i => !isEmpty(i));
      console.log('nextArray=', nextArray);
      await vaultContractWithSigner.callStatic.withdraw(nextValue, allowMaxLoss, true, nextArray);
      const tx = await vaultContractWithSigner.withdraw(nextValue, allowMaxLoss, true, nextArray);
      await tx.wait();
      message.success('数据提交成功')
    } catch (error) {
      console.error(error);
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          message.error('服务已关停，请稍后再试！');
        } else if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'Return amount is not enough\''
          || error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'Received amount of tokens are less then expected\'') {
          message.error('兑换失败，请加大兑换滑点或关闭兑换功能！');
        }
      }
    }
    setTimeout(() => {
      setWithdrawLoading(false);
      setToValue(0);
    }, 1000);
  };

  const setFromValuePercent = percent => {
    setFromValue(Math.round(parseFloat(toFixed(fromBalance, usdtDecimals)) * percent * 1000000) / 1000000);
  };

  const setToValuePercent = percent => {
    setToValue(Math.round(parseFloat(toFixed(toBalance, usdtDecimals)) * percent * 1000000) / 1000000);
  };

  useEffect(() => {
    loadBanlance();
    loadApy();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.on('Deposit', (a, b, c) => {
      console.log('Deposit=', a, b, c)
      c && c.getTransaction().then(tx => tx.wait()).then(loadBanlance);
    });
    vaultContract.on('Withdraw', (a, b, c, d, e, f, g) => {
      console.log('Withdraw=', a, b, c, d, e, f, g)
      g && g.getTransaction().then(tx => tx.wait()).then(loadBanlance);

    });
    return () => vaultContract.removeAllListeners(["Deposit", "Withdraw"])
  }, [address]);

  const deadline = lastDepositTimes.add(60 * 60 * 24).add(parseInt(Date.now() / 1000) - currentBlockTimestamp).mul(1000).toNumber();
  return (
    <Row>
      <Col span={24}>
        <Card
          title={[<span style={{ textAlign: "left", fontSize: 32 }}>{name}</span>, <span style={{ marginLeft: 10, textAlign: "left", fontSize: 32, color: 'red' }}>({vaultApy.div(100).toString()}%)</span>]}
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
                    <Button type="primary" disabled={parseFloat(fromValue) <= 0} loading={depositLoading}>
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
                  <div style={{ display: 'inline' }}>
                    &nbsp;&nbsp;Max Loss:&nbsp;
                    <InputNumber
                      style={{ width: 100 }}
                      value={allowMaxLoss / 100}
                      min={0}
                      max={100}
                      onChange={value => setAllowMaxLoss(value * 100)}
                    />&nbsp;%
                  </div>
                  &nbsp;&nbsp;
                  <Switch checked={shouldExchange} onChange={setShouldExchange}></Switch>
                  &nbsp;&nbsp;{shouldExchange ? '开启' : '关闭'}兑换
                </Col>
                <Col span={24}>
                  <Popconfirm
                    placement="topLeft"
                    title={`确认售出${toValue && toValue.toString()}份购入合约吗？`}
                    onConfirm={withdraw}
                    okText="是"
                    cancelText="否"
                  >
                    {
                      lastDepositTimes.gt(0) && withdrawFee.gt(0)
                        ? <Button type="primary" disabled={parseFloat(toValue) <= 0} loading={withdrawLoading}>
                          转出<span style={{ color: 'red', cursor: 'pointer', marginLeft: 5 }}>(-{toFixed(withdrawFee, 10 ** 2, 2)}%)</span>
                        </Button>
                        : <Button type="primary" disabled={parseFloat(toValue) <= 0} loading={withdrawLoading}>
                          转出
                        </Button>}
                  </Popconfirm>
                  {
                    lastDepositTimes.gt(0) && withdrawFee.gt(0) && <Tooltip title="距离上一次存款时间未达到24小时，支取需要支付额外的手续费用。">
                      <span style={{ color: 'red', fontSize: 16, marginLeft: 10, cursor: 'pointer' }}>剩余锁定时间：</span>
                      <Countdown style={{
                        display: "inline-flex"
                      }}
                        valueStyle={{
                          color: 'red',
                          fontSize: 16,
                          cursor: 'pointer'
                        }}
                        title={null} value={deadline} format="HH:mm:ss" />
                    </Tooltip>
                  }
                </Col>
              </Row>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}
