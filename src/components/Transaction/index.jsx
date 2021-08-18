/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Row, Col, Tag, Button, Card, InputNumber, Popconfirm, message } from "antd";
import isEmpty from "lodash/isEmpty";
import * as ethers from "ethers";
import { BigNumber } from 'ethers';

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI } from "./../../constants";

// === Utils === //
import { toFixed } from "./../../helpers/number-format"

export default function Transaction(props) {
  const { name, from, address, userProvider } = props;
  const [fromValue, setFromValue] = useState(0);
  const [toValue, setToValue] = useState(0);
  const [usdtDecimals] = useState(BigNumber.from(1e6));

  const [fromBalance, setFromBalance] = useState(BigNumber.from(0));
  const [toBalance, setToBalance] = useState(BigNumber.from(0));
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1));

  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(1));

  const [allowMaxLoss, setAllowMaxLoss] = useState(100);
  const loadBanlance = () => {
    if (isEmpty(address)) return loadBanlance;
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(from, STRATEGY_ABI, userProvider);
    usdtContract.balanceOf(address).then(setFromBalance);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.balanceOf(address).then(setToBalance);
    vaultContract.pricePerShare().then(setPerFullShare);
    vaultContract.decimals().then(setUnderlyingUnit);
  };

  const diposit = async () => {
    // 获取usdc的合约
    const usdtContract = new ethers.Contract(from, STRATEGY_ABI, userProvider);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const usdtContractWithUser = usdtContract.connect(signer);
    const nVaultWithUser = vaultContract.connect(signer);
    const nextValue = fromValue * usdtDecimals
    setFromValue(0);
    try {
      const firstApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, 0);
      await firstApproveTx.wait();
      const secondApproveTx = await usdtContractWithUser.approve(VAULT_ADDRESS, nextValue);
      await secondApproveTx.wait();
      const depositTx = await nVaultWithUser.deposit(nextValue);
      await depositTx.wait();
      message.loading('数据提交中...', 2.5).then(() => message.success('数据提交成功', 2.5))
    } catch (error) {
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'vault has been emergency shutdown\'') {
          message.error('服务已关停，请稍后再试！');
        }
      }
    }
  };

  const withdraw = async () => {
    const signer = userProvider.getSigner();
    const nextValue = `${toValue * 1e6}`;
    setToValue(0);
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      const tx = await vaultContract.connect(signer).withdraw(nextValue, allowMaxLoss);
      message.loading('数据提交中...', 2.5).then(() => message.success('数据提交成功', 2.5));
      await tx.wait();
    } catch (error) {
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'vault has been emergency shutdown\'') {
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
    vaultContract.on('Deposit', (to, amount, from) => {
      from.getTransaction().then(tx => tx.wait()).then(loadBanlance);
    });
    vaultContract.on('Withdraw', (to, amount, from) => {
      from.getTransaction().then(tx => tx.wait()).then(loadBanlance);
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
                  &nbsp;&nbsp;Max loss:&nbsp;
                  <InputNumber
                    style={{ width: 100 }}
                    value={allowMaxLoss / 100}
                    min={0}
                    max={100}
                    onChange={value => setAllowMaxLoss(value * 100)}
                  />&nbsp;%
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
