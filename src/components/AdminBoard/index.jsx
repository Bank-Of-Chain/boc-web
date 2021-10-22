/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { Row, Menu, Dropdown, PageHeader, Tag, Statistic, Tooltip } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Address from '../Address';
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, USDT_ADDRESS, IERC20_ABI } from "./../../constants";

// === Utils === //
import { toFixed } from "./../../helpers/number-format"
import map from "lodash/map"

const { BigNumber } = ethers;

function AdminBoard(props) {
  const { address, blockExplorer, mainnetProvider, logoutOfWeb3Modal, history, refreshSymbol, userProvider } = props;

  const [totalAssets, setTotalAssets] = useState(BigNumber.from(0));
  const [strategyTotalAssetsValue, setStrategyTotalAssetsValue] = useState(BigNumber.from(0));
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(0));

  const [bufferTotal, setBufferTotal] = useState(BigNumber.from(0));
  const [balanceOfTrackedToken, setBalanceOfTrackedToken] = useState([]);

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
      vaultContract.valueOfTrackedTokens().then(setBufferTotal);

      vaultContract.getTrackedAssets().then(trackedAssets => {
        Promise.all(map(trackedAssets, async (trackedAssetItem) => {
          const trackedAssetConstract = new ethers.Contract(trackedAssetItem, IERC20_ABI, userProvider)
          return {
            name: await trackedAssetConstract.symbol(),
            decimals: await trackedAssetConstract.decimals(),
            amount: await trackedAssetConstract.balanceOf(VAULT_ADDRESS)
          }
        })).then(setBalanceOfTrackedToken);
      })

      vaultContract.pricePerShare().then(setPerFullShare);

      vaultContract.treasure().then(treasureAddress => {
        vaultContract.balanceOf(treasureAddress).then(setTreasureBalance);
      });
    } catch (error) {
      console.error('error', error);
    }
  }
  const balanceOfTrackedTokenText = map(balanceOfTrackedToken, item => {
    return [<span>{item.name}: {toFixed(item.amount, 10 ** item.decimals)}</span>, <br />]
  });
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
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>国库拥有份额</span>}
        style={{
          marginLeft: 32,
        }}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={`${toFixed(treasureBalance, 10 ** 6)}（${treasureBalance * perFullShare / 10 ** 12} USDT）`}
      />
      <Tooltip placement="bottom" title={balanceOfTrackedTokenText}>
        <Statistic
          title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>缓冲池资金</span>}
          style={{
            marginLeft: 32,
          }}
          suffix={`(USDT)`}
          valueStyle={{
            fontWeight: 'bold', color: '#000', fontSize: 'x-large'
          }}
          value={toFixed(bufferTotal, 10 ** underlyingUnit)}
        />
      </Tooltip>
    </Row>
  </PageHeader>
}

export default AdminBoard
