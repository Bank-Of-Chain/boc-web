/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Menu, Dropdown, PageHeader, Tag, Statistic } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Address from '../Address';
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI, USDT_ADDRESS, LUSD_ADDRESS } from "./../../constants";

// === Utils === //
import { toFixed } from "./../../helpers/number-format"

const { BigNumber } = ethers;

function AdminBoard(props) {
  const { address, blockExplorer, mainnetProvider, logoutOfWeb3Modal, history, refreshSymbol, userProvider } = props;

  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0));
  const [strategyTotalAssetsValue, setStrategyTotalAssetsValue] = useState(BigNumber.from(0));
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(0));

  const [bufferTotal, setBufferTotal] = useState(BigNumber.from(0));
  // const [lusdTotal, setLusdTotal] = useState(BigNumber.from(0));

  const [treasureBalance, setTreasureBalance] = useState(BigNumber.from(0));

  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1));

  useEffect(() => {
    loadData();
  }, [address, refreshSymbol]);
  const loadData = () => {
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      vaultContract.totalAssets().then(setTotalAssets);
      vaultContract.totalDebt().then(setStrategyTotalAssetsValue);
      vaultContract.decimals().then(setUnderlyingUnit);
      const usdtContract = new ethers.Contract(USDT_ADDRESS, STRATEGY_ABI, userProvider);
      usdtContract.balanceOf(VAULT_ADDRESS).then(setBufferTotal);
      // const lusdContract = new ethers.Contract(LUSD_ADDRESS, STRATEGY_ABI, userProvider);
      // lusdContract.balanceOf(VAULT_ADDRESS).then(setLusdTotal);

      vaultContract.pricePerShare().then(setPerFullShare);

      vaultContract.treasure().then(treasureAddress => {
        vaultContract.balanceOf(treasureAddress).then(setTreasureBalance);
      });
    } catch (error) {
      console.error('error', error);
    }
  }

  return <PageHeader
    onBack={() => {
      history.push({
        pathname: "/",
      });
    }}
    title="Piggy.Finance"
    tags={<Tag color="blue">Running</Tag>}
    subTitle="管理员看板"
    extra={[
      <Dropdown.Button
        key="1"
        style={{ paddingLeft: 12 }}
        icon={<UserOutlined />}
        overlay={
          <Menu>
            <Menu.Item key="01">
              <Link to="/admin" >
                Admin Page
              </Link>
            </Menu.Item>
            <Menu.Item key="02" icon={<LogoutOutlined />} onClick={logoutOfWeb3Modal}>
              Logout
            </Menu.Item>
          </Menu>
        }
      >
        <Address size="short" address={address} ensProvider={mainnetProvider} blockExplorer={blockExplorer} />
      </Dropdown.Button>,
    ]}
  >
    <Row>
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>池子总资产</span>}
        suffix="(USDT)"
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={toFixed(totalAssets, 10 ** underlyingUnit)}
      />
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>策略总额</span>}
        style={{
          marginLeft: 32,
        }}
        suffix="(USDT)"
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={toFixed(strategyTotalAssetsValue, 10 ** underlyingUnit)}
      />
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>缓冲池资金</span>}
        style={{
          marginLeft: 32,
        }}
        suffix="(USDT)"
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={toFixed(bufferTotal, 10 ** underlyingUnit)}
      />
      {/* <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>缓冲池资金</span>}
        style={{
          marginLeft: 32,
        }}
        suffix="(LUSD)"
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={toFixed(lusdTotal, 10 ** 18)}
      /> */}
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>国库拥有份额</span>}
        style={{
          marginLeft: 32,
        }}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={`${toFixed(treasureBalance, 10 ** 6)}（${treasureBalance * perFullShare / 10 ** 12} USDT）`}
      />
    </Row>
  </PageHeader>
}

export default AdminBoard
