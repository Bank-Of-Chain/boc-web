/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Popconfirm, Input, Button, Tooltip, message, Row, Col } from 'antd';
import { CloudSyncOutlined, SettingOutlined } from "@ant-design/icons";
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI, IERC20_ABI, EXCHANGE_AGGREGATOR_ABI, APY_SERVER, EXCHANGE_EXTRA_PARAMS, USDT_ADDRESS } from "./../../constants";

// === Utils === //
import map from 'lodash/map';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';
import { toFixed } from "./../../helpers/number-format";
import { getBestSwapInfo } from 'piggy-finance-utils';
import request from "request";

// === Components === //
import OriginApy from './OriginApy';

const slipper = 30;

const getExchangePlatformAdapters = async (exchangeAggregator) => {
  const adapters = await exchangeAggregator.getExchangeAdapters();
  const exchangePlatformAdapters = {};
  for (let i = 0; i < adapters.identifiers_.length; i++) {
    exchangePlatformAdapters[adapters.identifiers_[i]] = adapters.exchangeAdapters_[i];
  }
  return exchangePlatformAdapters;
}

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
      const wantAddress = await contract.want();
      const wantContract = new ethers.Contract(wantAddress, IERC20_ABI, userProvider);
      return await Promise.all([
        contract.name(),
        vaultContract.strategies(item),
        contract.balanceOfLpToken(),
        contract.estimatedTotalAssetsToVault(),
        vaultContract.getStrategyApy(item),
        wantContract.balanceOf(item),
        contract._emergencyExit(),
      ]).then(([
        name, vaultState, balanceOfLpToken, estimatedTotalAssets, apy, balanceOfWant, emergencyExit
      ]) => {
        const {
          activation, enforceChangeLimit, lastReport, totalDebt, totalGain, totalLoss
        } = vaultState
        return {
          key: item,
          name: name,
          address: item,
          apy,
          enforceChangeLimit,
          activation,
          totalDebt,
          totalGain,
          totalLoss,
          lastReport,
          balanceOfLpToken,
          balanceOfWant,
          estimatedTotalAssets,
          emergencyExit
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
    const tx = await vaultContract.connect(signer).addStrategy(
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
    );
    await tx.wait();
    await loadBanlance();
    await refreshCallBack();
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
    const tx = await vaultContract.connect(signer).updateStrategyApy([id], [nextValue])
    await tx.wait();
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

  const emergencyExit = async (address) => {
    const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.emergencyExit();
    await tx.wait();
    loadBanlance();
  }

  /**
   * 策略退出紧急情况
   * @param {*} address 
   */
  const resetEmergencyExit = async (address) => {
    const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
    const signer = userProvider.getSigner();
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.resetEmergencyExit();
    await tx.wait();
    loadBanlance();
  }

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

  /**
   * 执行策略lend操作
   */
  const lend = async (address, value) => {
    if (isEmpty(address)) return Promise.reject();

    const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
    const wantAddress = await contract.want();
    const nextValue = BigNumber.from(value).mul(10 ** 6);

    let exchangeParam = {
      platform: '0x0000000000000000000000000000000000000000',
      method: '0',
      encodeExchangeArgs: '0x'
    }
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    // 如果策略稳定币不是USDT，则需要匹配兑换路径
    if (wantAddress !== USDT_ADDRESS) {
      const exchangeManager = await vaultContract.exchangeManager();
      const exchangeManagerContract = await new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
      const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)

      const wantAddressContract = new ethers.Contract(wantAddress, IERC20_ABI, userProvider);
      const underlyingContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);
      exchangeParam = await getBestSwapInfo({
        decimals: (await underlyingContract.decimals()).toString(),
        address: USDT_ADDRESS
      }, {
        decimals: (await wantAddressContract.decimals()).toString(),
        address: wantAddress
      },
        nextValue.toString(),
        slipper,
        exchangePlatformAdapters,
        EXCHANGE_EXTRA_PARAMS
      );
    }

    try {
      const signer = userProvider.getSigner();
      const tx = await vaultContract.connect(signer).lend(address, USDT_ADDRESS, nextValue.toString(), exchangeParam);
      await tx.wait()
      loadBanlance();
      refreshCallBack();
    } catch (error) {
      if (error && error.data) {
        if (error.data.message === 'Error: VM Exception while processing transaction: reverted with reason string \'ES\'') {
          message.error('服务已关停，请稍后再试！');
        } else {
          message.error('操作异常！');
        }
      }
    }
  }

  /**
   * 执行策略redeem操作
   */
  const redeem = async (strategyAddress, totalAsset) => {
    if (isEmpty(strategyAddress) || totalAsset < 0)
      return;

    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const tx = await vaultContract.connect(signer).redeem(strategyAddress, totalAsset)
    await tx.wait();
    loadBanlance();
    refreshCallBack();
  }

  /**
   * 执行策略exchange操作
   */
  // const exchange = async (address) => {
  //   if (isEmpty(address)) return Promise.reject();

  //   const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
  //   const wantAddress = await contract.want();

  //   const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
  //   const wantContract = new ethers.Contract(wantAddress, IERC20_ABI, userProvider);
  //   const underlyingContract = new ethers.Contract(USDT_ADDRESS, IERC20_ABI, userProvider);
  //   const value = await wantContract.balanceOf(VAULT_ADDRESS);
  //   let exchangeParam = {
  //     platform: '0x0000000000000000000000000000000000000000',
  //     method: '0',
  //     encodeExchangeArgs: '0x'
  //   }
  //   // 如果策略稳定币不是USDT，则需要匹配兑换路径
  //   if (wantAddress !== USDT_ADDRESS) {
  //     const exchangeManager = await vaultContract.exchangeManager();
  //     const exchangeManagerContract = await new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
  //     const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
  //     exchangeParam = await getBestSwapInfo({
  //       decimals: (await wantContract.decimals()).toString(),
  //       address: wantAddress
  //     }, {
  //       decimals: (await underlyingContract.decimals()).toString(),
  //       address: USDT_ADDRESS
  //     },
  //       value,
  //       slipper,
  //       exchangePlatformAdapters
  //     );
  //   }

  //   const signer = userProvider.getSigner();
  //   const tx = vaultContract.connect(signer).exchange(wantAddress, USDT_ADDRESS, value.toString(), exchangeParam)
  //   await tx.wait();
  //   loadBanlance();
  //   refreshCallBack();
  // }

  /**
   * 调用定时器的api服务
   */
  const callApi = (method) => {
    const close = message.loading('接口调用中...', 60 * 60);
    request.get(`${APY_SERVER}/v3/${method}`, (error, response, body) => {
      console.log('error, response, bod=', error, response, body);
      close();
      if (error) {
        message.error('接口调用失败');
      } else {
        message.success('接口调用成功');
      }
      setTimeout(() => {
        loadBanlance()
        refreshCallBack()
      }, 2000);
    });
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
      title: '上报估值',
      dataIndex: 'totalDebt',
      key: 'totalDebt',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** underlyingUnit)}</span>;
      }
    },
    {
      title: '策略估值',
      dataIndex: 'estimatedTotalAssets',
      key: 'estimatedTotalAssets',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** underlyingUnit)}</span>;
      }
    },
    {
      title: '稳定币数量',
      dataIndex: 'balanceOfWant',
      key: 'balanceOfWant',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value)}</span>;
      }
    },
    {
      title: '收益总额',
      dataIndex: 'totalGain',
      key: 'totalGain',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** 6)}</span>;
      }
    },
    {
      title: '损失总额',
      dataIndex: 'totalLoss',
      key: 'totalLoss',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value, 10 ** 6)}</span>;
      }
    },
    {
      title: '最近上报时间',
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
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1e2, 2)}% (<OriginApy id={item.address} days={3} />)</span>&nbsp;
          <Input.Search onSearch={(v) => setApy(item.address, v)} enterButton={<SettingOutlined />} style={{ width: 120, float: 'right' }} />
        </div>
      }
    },
    {
      title: '投资',
      render: (value, item, index) => {
        return <div>
          <Input.Search onSearch={(v) => lend(item.address, v)} enterButton='Lend' style={{ width: 150 }} />
        </div>
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (value, item) => {
        const { address, totalDebt, emergencyExit: emergencyExitValue } = value;
        return <Space size="middle">
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Harvest操作？'}
            onConfirm={() => doHardWork(address)}
            okText="是"
            cancelText="否"
          >
            <a>Harvest</a>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Emergency Exit操作？'}
            onConfirm={() => emergencyExit(address)}
            okText="是"
            cancelText="否"
          >
            <a>Emergency Exit</a>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Redeem操作？'}
            onConfirm={() => redeem(address, totalDebt.toString())}
            okText="是"
            cancelText="否"
          >
            <a>Redeem</a>
          </Popconfirm>
          {/* 
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Exchange操作？'}
            onConfirm={() => exchange(address)}
            okText="是"
            cancelText="否"
          >
            <a>Exchange</a>
          </Popconfirm>
           */}
          {
            emergencyExitValue && <Popconfirm
              placement="topLeft"
              title={'确认立刻执行Reset操作？'}
              onConfirm={() => resetEmergencyExit(address)}
              okText="是"
              cancelText="否"
            >
              <a>Reset</a>
            </Popconfirm>
          }
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
        <Col span={6}>
          <Input.Search
            addonBefore={<CloudSyncOutlined title="刷新策略数据" onClick={loadBanlance} />}
            placeholder="请输入合约地址"
            enterButton="添加"
            onSearch={addStrategy}
          />
        </Col>

        <Col offset={1} span={17}>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻进行该操作？'}
            onConfirm={() => callApi('do-hardwork')}
            okText="是"
            cancelText="否"
          >
            <Button style={{ marginRight: 20 }} type="primary" >
              do hardwork
            </Button>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻进行该操作？'}
            onConfirm={() => callApi('allocation')}
            okText="是"
            cancelText="否"
          >
            <Button style={{ marginRight: 20 }} type="primary" >
              allocation
            </Button>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻进行该操作？'}
            onConfirm={() => callApi('harvest')}
            okText="是"
            cancelText="否"
          >
            <Button style={{ marginRight: 20 }} type="primary" >
              harvest
            </Button>
          </Popconfirm>
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