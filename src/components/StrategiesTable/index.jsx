/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Popconfirm, Input, Button, Tooltip, message, Row, Col } from 'antd';
import { CloudSyncOutlined, SettingOutlined } from "@ant-design/icons";
import * as ethers from "ethers";
import request from "request";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI } from "./../../constants";

// === Utils === //
import map from 'lodash/map';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';
import { toFixed } from "./../../helpers/number-format"

const { BigNumber } = ethers

export default function StrategiesTable(props) {
  const { userProvider, refreshSymbol, refreshCallBack } = props;
  const [data, setData] = useState([]);
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(1));
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

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
        new Promise((resolve) => {
          request(`http://192.168.254.27:3000/v3/strategy/${item}/apy/3`, (error, response, body) => {
            const obj = JSON.parse(body)
            resolve(obj.data.apy)
          })
        })
      ]).then(([
        name, vaultState, minReturnBps, estimatedTotalAssets, balanceOfLpToken, apy, minReportDelay, maxReportDelay, profitFactor, debtThreshold, originApy
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
          debtThreshold,
          originApy
        };
      });
    }));
    setData(nextData);
  }

  /**
   * 移除策略
   * @param {string} id 策略id 
   * @returns 
   */
  const removeStrategy = async (id) => {
    if (isEmpty(id)) return;
    console.log('id=', id);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    await vaultContract.connect(signer).removeStrategy(`${id}`)
      .then(tx => tx.wait());
    loadBanlance();
  }

  /**
   * 添加策略
   * @param {string} id 策略id 
   * @returns 
   */
  const addStrategy = async (id) => {
    if (isEmpty(id)) return;
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    await vaultContract.connect(signer).addStrategy(
      [
        {
          strategy: id,
          apy: 2000,
          debtRatio: 1000,
          minDebtPerHarvest: 1000,
          maxDebtPerHarvest: 3000000000000,
          profitLimitRatio: 100,
          lossLimitRatio: 100
        }
      ]
    ).then(tx => tx.wait());
    loadBanlance();
    refreshCallBack();
  }

  /**
   * 
   * @param {string} id 策略地址 
   * @param {number} value 设置的指
   * @returns 
   */
  const setDebtRatio = async (id, value) => {
    if (isEmpty(id) || isEmpty(value))
      return;
    const nextValue = parseInt(value * 1e2);
    if (isNaN(nextValue) || nextValue < 0 || nextValue > 10000) {
      message.error('请设置合适的数值');
      return;
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    await vaultContract.connect(signer).updateStrategyDebtRatio([id], [nextValue])
      .then(tx => tx.wait());
    loadBanlance();
  }

  /**
   * 设置apy
   * @param {string} id 策略地址 
   * @param {number} value 设置的指
   * @returns 
   */
  const setApy = async (id, value) => {
    if (isEmpty(id) || isEmpty(value))
      return;
    const nextValue = parseInt(value * 1e2);
    if (isNaN(nextValue) || nextValue < 0 || nextValue > 10000) {
      message.error('请设置合适的数值');
      return;
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    console.log('updateStrategyApy=', id, nextValue);
    await vaultContract.connect(signer).updateStrategyApy([id], [nextValue])
      .then(tx => tx.wait());
    loadBanlance();
  }
  /**
   * dohardwork操作
   */
  const doHardWork = async (address) => {
    if (isEmpty(address)) return Promise.reject();

    const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.harvest();
    const resp = await tx.wait();
    return resp;
  };

  /**
   * 批量执行策略doHardWork
   */
  const batchDoHardWork = () => {
    if (isEmpty(selectedRowKeys)) {
      message.error('请选中策略条目');
      return;
    }
    ;
    Promise.all(selectedRowKeys.map(async (addr) => {
      await doHardWork(addr);
    })).then(loadBanlance).then(refreshCallBack);
  }

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: "15%",
      render: (text, item, index) => {
        return <Tooltip placement="topLeft" title={`LPs : ${item.balanceOfLpToken.toString()}`}>
          <a key={index}>{text}</a>
        </Tooltip>
      }
    },
    {
      title: '成本',
      dataIndex: 'totalDebt',
      key: 'totalDebt',
      render: (value, index) => {
        return <span key={index}>{toFixed(value, 10 ** underlyingUnit)}</span>;
      }
    },
    {
      title: '稳定币估值',
      dataIndex: 'estimatedTotalAssets',
      key: 'estimatedTotalAssets',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** underlyingUnit)}</span>;
      }
    },
    {
      title: 'USDT估值',
      dataIndex: 'totalAsset',
      key: 'totalAsset',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** underlyingUnit)}</span>;
      }
    },
    {
      title: '最近dohardwork时间',
      dataIndex: 'lastReport',
      key: 'lastReport',
      render: (value, index) => {
        if (isEmpty(value)) return '';
        return <span key={index}>{value.toNumber() !== 0 && new Date(value.mul(1000).toNumber()).format("yyyy-MM-dd HH:mm:ss")}</span>;
      }
    },
    {
      title: 'Apy (实时Apy)',
      dataIndex: 'apy',
      key: 'apy',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1e2, 2)}% ({toFixed(BigNumber.from(item.originApy), 1e2, 2)}%)</span>&nbsp;
          <Input.Search onSearch={(v) => setApy(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '投资比例',
      dataIndex: 'debtRatio',
      key: 'debtRatio',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1e2, 2)}%</span>&nbsp;
          <Input.Search onSearch={(v) => setDebtRatio(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (value, item) => {
        const { address } = value;
        return <Space size="middle">
          <Popconfirm
            placement="topLeft"
            title={'确认立刻获取盈利？'}
            onConfirm={() => doHardWork(address).then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <a>获取盈利</a>
          </Popconfirm>
          {
            item.totalDebt.toString() === '0' && item.balanceOfLpToken.toString() === '0' &&
            <Popconfirm
              placement="topLeft"
              title={'确认立刻移除该策略？'}
              onConfirm={() => removeStrategy(address)}
              okText="是"
              cancelText="否"
            >
              <a style={{ color: 'red' }}>移除策略</a>
            </Popconfirm>
          }
        </Space>
      }
    },
  ]

  useEffect(() => {
    loadBanlance();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.decimals().then(setUnderlyingUnit).catch(() => { })
  }, []);

  const rowSelection = {
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  return <Card title={<span style={{ fontWeight: 'bold' }}>各个策略投资详情</span>} bordered
    extra={
      <Row>
        <Col span={16}>
          <Input.Search
            addonBefore={<CloudSyncOutlined title="刷新策略数据" onClick={loadBanlance} />}
            placeholder="请输入合约地址"
            enterButton="添加"
            onSearch={addStrategy}
          />
        </Col>

        <Col offset={1} span={5}>
          <Popconfirm
            placement="topLeft"
            title={'确认批量获取选中策略盈利？'}
            onConfirm={batchDoHardWork}
            okText="是"
            cancelText="否"
          >
            <Button type="primary">批量获取盈利</Button>
          </Popconfirm>
        </Col>

      </Row>
    }
  >
    <Table bordered columns={columns} rowSelection={rowSelection} dataSource={data} pagination={false} />
  </Card>
}