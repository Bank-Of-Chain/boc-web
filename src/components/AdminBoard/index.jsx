/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Menu, Dropdown, PageHeader, Tag, Statistic } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Address from '../Address';
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI } from "./../../constants";

// === Utils === //
import { toFixed } from "./../../helpers/number-format"

const { BigNumber } = ethers;

function AdminBoard(props) {
  const { address, blockExplorer, mainnetProvider, logoutOfWeb3Modal, history, refreshSymbol, userProvider } = props;

  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0));
  const [strategyTotalAssetsValue, setStrategyTotalAssetsValue] = useState(BigNumber.from(0));
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(0));

  const [bufferTotal, setBufferTotal] = useState(BigNumber.from(0));

  useEffect(() => {
    loadData();
  }, [address, refreshSymbol]);
  const loadData = () => {
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      vaultContract.totalAssets().then(setTotalAssets);
      vaultContract.totalOriginalDebt().then(setStrategyTotalAssetsValue);
      vaultContract.decimals().then(setUnderlyingUnit);

      const usdtContract = new ethers.Contract('0xdAC17F958D2ee523a2206206994597C13D831ec7', STRATEGY_ABI, userProvider);
      usdtContract.balanceOf(VAULT_ADDRESS).then(setBufferTotal)
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
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>池子总成本</span>}
        style={{
          marginLeft: 32,
        }}
        suffix="(USDT)"
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={toFixed(BigNumber.from(strategyTotalAssetsValue).add(BigNumber.from(bufferTotal)), 10 ** underlyingUnit)}
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
    </Row>
  </PageHeader>
}

export default AdminBoard
