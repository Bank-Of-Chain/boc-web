/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/anchor-is-valid */

import React, { useState, useEffect } from 'react';
import { Card, Table, Space, Popconfirm, Input, Button, Tooltip, message, Row, Col, Spin } from 'antd';
import { SettingOutlined } from "@ant-design/icons";
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, STRATEGY_ABI, IERC20_ABI, EXCHANGE_AGGREGATOR_ABI, APY_SERVER, EXCHANGE_EXTRA_PARAMS, USDT_ADDRESS } from "./../../constants";

// === Utils === //
import map from 'lodash/map';
import isNaN from 'lodash/isNaN';
import isEmpty from 'lodash/isEmpty';
import mapKeys from 'lodash/mapKeys';
import sortBy from 'lodash/sortBy';
import { toFixed } from "./../../helpers/number-format";
import { lendSwap } from 'piggy-finance-utils';
import request from "request";

const { utils } = ethers;

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
  const { userProvider, refreshSymbol, refreshCallBack, address } = props;
  const [data, setData] = useState([]);
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(1));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBanlance();
  }, [refreshSymbol]);


  const loadBanlance = async () => {
    setLoading(true);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const strategiesAddress = await vaultContract.getStrategies();
    const nextData = await Promise.all(map(strategiesAddress, async (item) => {
      const contract = new ethers.Contract(item, STRATEGY_ABI, userProvider);
      const wantAddress = await contract.getWants();
      return await Promise.all([
        contract.name(),
        vaultContract.strategies(item),
        contract.balanceOfLpToken().catch(() => Promise.resolve(BigNumber.from(0))),
        contract.estimatedTotalAssets().catch(() => Promise.resolve(BigNumber.from(0))),
        vaultContract.getStrategyApy(item),
        Promise.all(map(wantAddress, async (wantItem) => {
          const wantItemContract = new ethers.Contract(wantItem, IERC20_ABI, userProvider);
          return {
            name: await wantItemContract.symbol(),
            amount: await wantItemContract.balanceOf(item)
          }
        })),
      ]).then(([
        name, vaultState, balanceOfLpToken, estimatedTotalAssets, apy, balanceOfWant
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
          estimatedTotalAssets
        };
      });
    }));
    setData(sortBy(nextData, [i => -1 * i.apy]));
    setTimeout(() => {
      setLoading(false);
    }, 1000);
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
    await tx.wait();
  };

  /**
   * 执行策略lend操作
   */
  const lend = async (address, value) => {
    if (isEmpty(address)) return Promise.reject();

    // 新版 lend 方法改造
    const decimalsMachine = (token, vaule, decimals) => vaule * 10 ** decimals

    const nextValue = BigNumber.from(value).mul(10 ** 6);

    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const contract = new ethers.Contract(address, STRATEGY_ABI, userProvider);
    const strateAspect = await contract.queryTokenAspect();
    const strateAspectNext = map(strateAspect, item => {
      return {
        ...item,
        aspect: parseInt(item.aspect.toString())
      }
    })

    console.log('strateAspectNext=', strateAspectNext);
    const tokenMap = mapKeys(await Promise.all(map(strateAspectNext, async (item) => {
      const token = new ethers.Contract(item.token, IERC20_ABI, userProvider);
      return {
        decimals: parseInt((await token.decimals()).toString()),
        symbol: await token.symbol(),
        address: item.token
      }
    })), 'address');

    tokenMap[USDT_ADDRESS] = {
      decimals: 6,
      symbol: 'USDT',
      address: USDT_ADDRESS
    }
    const exchangeManager = await vaultContract.exchangeManager();
    const exchangeManagerContract = await new ethers.Contract(exchangeManager, EXCHANGE_AGGREGATOR_ABI, userProvider);
    const exchangePlatformAdapters = await getExchangePlatformAdapters(exchangeManagerContract)
    const path = await lendSwap(parseInt(nextValue.toString()), strateAspectNext, decimalsMachine, exchangePlatformAdapters, EXCHANGE_EXTRA_PARAMS, tokenMap)
    try {
      const signer = userProvider.getSigner();
      const tx = await vaultContract.connect(signer).lend(address, path);
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
  }

  /**
   * 调用定时器的api服务
   */
  const callApi = async (method) => {
    const signer = userProvider.getSigner();
    const timestamp = Date.now();
    const messageHash = utils.id(`${method}:${address}:${timestamp}`);

    const messageHashBytes = utils.arrayify(messageHash)

    const signature = await signer.signMessage(messageHashBytes);
    const close = message.loading('接口调用中...', 60 * 60);
    const headers = {
      timestamp,
      signature
    }
    return new Promise((resolve, reject) => {
      request.post(`${APY_SERVER}/v3/${method}`, { headers }, (error, response, body) => {
        console.log('error, response, bod=', error, response, body);
        close();
        if (error) {
          message.error('接口调用失败');
          reject();
        } else {
          message.success('接口调用成功');
          resolve();
        }
      });
    })
  }

  const columns = [
    {
      title: '策略名称',
      dataIndex: 'name',
      key: 'name',
      width: "15%",
      render: (text, item, index) => {
        const { balanceOfWant } = item;
        const balanceOfWantText = map(balanceOfWant, item => {
          return [<span key={item.name}>{item.name}: {toFixed(item.amount)}</span>, <br key={`${item.name}-br`} />]
        });
        return <Tooltip placement="topLeft" title={balanceOfWantText}>
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
      title: 'LP数量',
      dataIndex: 'balanceOfLpToken',
      key: 'balanceOfLpToken',
      render: (value, item, index) => {
        return <span key={index}>{toFixed(value)}</span>
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
      title: 'Apy',
      dataIndex: 'apy',
      key: 'apy',
      render: (value, item, index) => {
        return <div>
          <span style={{ lineHeight: '32px' }} key={index}>{toFixed(value, 1e2, 2)}%</span>&nbsp;
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
        const { address, totalDebt } = value;
        return <Space size="middle">
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Harvest操作？'}
            onConfirm={() => doHardWork(address).then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <a>Harvest</a>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻执行Redeem操作？'}
            onConfirm={() => redeem(address, totalDebt.toString()).then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <a>Redeem</a>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻移除该策略？'}
            onConfirm={() => removeStrategy(address).then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <a style={{ color: 'red' }}>移除策略</a>
          </Popconfirm>
        </Space>
      }
    },
  ]

  useEffect(() => {
    loadBanlance();
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    vaultContract.decimals().then(setUnderlyingUnit).catch(() => { })
  }, []);

  return <Card title={<span style={{ fontWeight: 'bold' }}>各个策略投资详情</span>} bordered
    extra={
      <Row>
        <Col span={6}>
          <Input.Search
            placeholder="请输入合约地址"
            enterButton="添加"
            onSearch={addStrategy}
          />
        </Col>

        <Col offset={1} span={17}>
          <Button style={{ marginRight: 20 }} type="primary" loading={loading} onClick={loadBanlance} >
            刷新数据
          </Button>
          <Popconfirm
            placement="topLeft"
            title={'确认立刻进行该操作？'}
            onConfirm={() => callApi('do-hardwork').then(loadBanlance).then(refreshCallBack)}
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
            onConfirm={() => callApi('allocation').then(loadBanlance).then(refreshCallBack)}
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
            onConfirm={() => callApi('harvest').then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <Button style={{ marginRight: 20 }} type="primary" >
              harvest
            </Button>
          </Popconfirm>
          <Popconfirm
            placement="topLeft"
            title={'确认批量更新apy？'}
            onConfirm={() => callApi('update-apy').then(loadBanlance).then(refreshCallBack)}
            okText="是"
            cancelText="否"
          >
            <Button type="primary">更新Apy</Button>
          </Popconfirm>
        </Col>
      </Row>
    }
  >
    <Spin spinning={loading} size="large" tip="数据加载中...">
      <Table bordered columns={columns}
        dataSource={data} pagination={false} />
    </Spin>
  </Card>
}