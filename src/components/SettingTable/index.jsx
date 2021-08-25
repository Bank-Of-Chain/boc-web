/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react';
import { Card, Table, Input, message, Row, Col, Switch } from 'antd';
import { CloudSyncOutlined, SettingOutlined } from "@ant-design/icons";
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI } from "../../constants";

// === Utils === //
import map from 'lodash/map';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';
import { toFixed } from "../../helpers/number-format"

export default function SettingTable(props) {
  const { userProvider, refreshSymbol } = props;
  const [data, setData] = useState([]);

  useEffect(() => {
    loadBanlance();
  }, [refreshSymbol]);

  const loadBanlance = async () => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const strategiesAddress = await vaultContract.getStrategies();
    const nextData = await Promise.all(map(strategiesAddress, async (item) => {
      const contract = new ethers.Contract(item, STRATEGY_ABI, userProvider);
      return await Promise.all([
        contract.name(),
        vaultContract.strategies(item),
        contract.minReturnBps(),
        contract.estimatedTotalAssetsToVault(),
        contract.balanceOfLpToken(),
        vaultContract.getStrategyApy(item),
        contract.minReportDelay(),
        contract.maxReportDelay(),
        contract.profitFactor(),
        contract.debtThreshold(),
      ]).then(([
        name, vaultState, minReturnBps, estimatedTotalAssets, balanceOfLpToken, apy, minReportDelay, maxReportDelay, profitFactor, debtThreshold
      ]) => {
        const {
          debtRatio, enforceChangeLimit, activation, originalDebt, totalGain, totalLoss, lastReport, totalAsset
        } = vaultState
        return {
          key: item,
          name: name,
          address: item,
          debtRatio,
          enforceChangeLimit,
          activation,
          apy,
          totalDebt: originalDebt,
          totalAsset,
          totalGain,
          totalLoss,
          minReturnBps,
          lastReport,
          estimatedTotalAssets,
          balanceOfLpToken,
          minReportDelay,
          maxReportDelay,
          profitFactor,
          debtThreshold
        };
      });
    }));
    setData(nextData);
  }
  /**
   * 设置 apy 的数值
   * @param {string} id 策略地址
   * @param {number} value apy的值
   * @returns 
   */
  const setMinReturnBps = async (id, value) => {
    if (isEmpty(id) || isEmpty(value))
      return;
    const nextValue = parseInt(value * 1e2);
    if (isNaN(nextValue) || nextValue < 0 || nextValue > 10000) {
      message.error('请设置合适的数值');
      return;
    }
    const contract = new ethers.Contract(id, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    const contractWithSigner = contract.connect(signer);
    await contractWithSigner.setMinReturnBps(nextValue)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const setMinReportDelay = async (id, value) => {
    if (isNaN(value) || value < 0) {
      message.error('请设置合适的数值');
      return;
    }
    const strategyContract = new ethers.Contract(id, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    await strategyContract.connect(signer).setMinReportDelay(value)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const setMaxReportDelay = async (id, value) => {
    if (isNaN(value) || value < 0) {
      message.error('请设置合适的数值');
      return;
    }
    const strategyContract = new ethers.Contract(id, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    await strategyContract.connect(signer).setMaxReportDelay(value)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const setProfitFactor = async (id, value) => {
    if (isNaN(value) || value < 0) {
      message.error('请设置合适的数值');
      return;
    }
    const strategyContract = new ethers.Contract(id, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    await strategyContract.connect(signer).setProfitFactor(value)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const setDebtThreshold = async (id, value) => {
    if (isNaN(value) || value < 0) {
      message.error('请设置合适的数值');
      return;
    }
    const strategyContract = new ethers.Contract(id, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    await strategyContract.connect(signer).setDebtThreshold(value)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const onChange = async (id, value) => {
    if (isEmpty(id)) return;
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    await vaultContract.connect(signer).setStrategyEnforceChangeLimit(id, value)
      .then(tx => tx.wait());
    loadBanlance();
  }

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: "15%",
      render: (text, item, index) => {
        return <a key={index}>{text}</a>
      }
    },
    {
      title: '最小汇报间隔 (s)',
      dataIndex: 'minReportDelay',
      key: 'minReportDelay',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1)}</span>&nbsp;
          <Input.Search onSearch={(v) => setMinReportDelay(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '最大汇报间隔 (s)',
      dataIndex: 'maxReportDelay',
      key: 'maxReportDelay',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1)}</span>&nbsp;
          <Input.Search onSearch={(v) => setMaxReportDelay(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '成本倍数',
      dataIndex: 'profitFactor',
      key: 'profitFactor',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1)}</span>&nbsp;
          <Input.Search onSearch={(v) => setProfitFactor(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '债务阈值',
      dataIndex: 'debtThreshold',
      key: 'debtThreshold',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1)}</span>&nbsp;
          <Input.Search onSearch={(v) => setDebtThreshold(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '滑点阈值设置',
      dataIndex: 'minReturnBps',
      key: 'minReturnBps',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1e2, 2)}%</span>&nbsp;
          <Input.Search onSearch={(v) => setMinReturnBps(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '校验开关',
      dataIndex: 'enforceChangeLimit',
      key: 'enforceChangeLimit',
      render: (value, item, index) => {
        return <Switch size="small" onChange={v => onChange(item.address, v)} checked={value} />
      }
    },
  ]

  useEffect(() => {
    loadBanlance();
  }, []);

  return <Card title={<span style={{ fontWeight: 'bold' }}>策略参数配置</span>} bordered
    extra={
      <Row>
        <Col span={24}>
          <CloudSyncOutlined title="刷新策略数据" onClick={loadBanlance} />
        </Col>
      </Row>
    }
  >
    <Table bordered columns={columns} dataSource={data} pagination={false} />
  </Card>
}