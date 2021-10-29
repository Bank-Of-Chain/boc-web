/* eslint-disable no-return-assign */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Row, Col, Button, Card, Popconfirm, Divider, Input } from "antd";
import { withRouter, Redirect } from "react-router-dom";
import * as ethers from "ethers";

// === constants === //
import { VAULT_ADDRESS, VAULT_ABI, TREASURE_ABI } from "./../../constants";

// === Components === //
import AdminBoard from "../../components/AdminBoard";
import StrategiesTable from "../../components/StrategiesTable";
import SettingTable from "../../components/SettingTable";

// === Utils === //
import isEmpty from "lodash/isEmpty";
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";

function Admin(props) {
  const { writeContracts, address, history, userProvider } = props;
  const [governance, setGovernance] = useState('');
  const [status, setStatus] = useState();

  const [adjustPositionPeriod, setAdjustPositionPeriod] = useState();

  const [refreshCount, setRefreshCount] = useState(0);

  const [blackAddress, setBlackAddress] = useState('');
  const [blackAddressStatus, setBlackAddressStatus] = useState(false);

  const [reciveAddress, setReciveAddress] = useState('');

  /**
   * 执行开启/紧急关停操作
   */
  const lock = async (symbol) => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const tx = await vaultContract.connect(signer).setEmergencyShutdown(symbol);
    await tx.wait();
    vaultContract.emergencyShutdown().then(setStatus);
  }

  /**
   * 加入黑名单
   */
  const addToWhiteList = (bAddress) => {
    if (isEmpty(bAddress)) return;
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    vaultContract.connect(signer).addToWhiteList(bAddress);
    setBlackAddress('');
  }

  /**
   * 从黑名单移除
   */
  const removeFromWhiteList = (bAddress) => {
    if (isEmpty(bAddress)) return;
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    vaultContract.connect(signer).removeFromWhiteList(bAddress);
    setBlackAddress('');
  }

  /**
   * 地址修改时的事件回调
   */
  const handleAddressChange = (event) => {
    const { target: { value } } = event;
    setBlackAddress(value);
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    vaultContract.connect(signer).whiteList(value).then(setBlackAddressStatus)
  }

  /**
   * 设置调仓标识位
   * @param {*} symbol 
   */
  const setAdjustPosition = async (symbol) => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const signer = userProvider.getSigner();
    const tx = await vaultContract.connect(signer).setAdjustPositionPeriod(symbol);
    await tx.wait();
    setAdjustPositionPeriod(symbol);
  }

  /**
   * 国库收益提取至账户
   * @param {*} address 
   */
  const treasureWithdraw = async (address) => {
    const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
    const treasureAddress = await vaultContract.treasure();
    const amount = await vaultContract.balanceOf(treasureAddress);
    const treasureContract = new ethers.Contract(treasureAddress, TREASURE_ABI, userProvider);
    const signer = userProvider.getSigner();
    const tx = await treasureContract.connect(signer).withdraw(VAULT_ADDRESS, address, amount);
    await tx.wait();
  }

  useEffect(() => {
    try {
      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, userProvider);
      vaultContract.getManagement().then(setGovernance);
      vaultContract.emergencyShutdown().then(setStatus);
      vaultContract.adjustPositionPeriod().then(setAdjustPositionPeriod);
    } catch (error) {
    }
  }, []);
  if (!isEqual(governance, address)) {
    if (isEmpty(governance)) {
      return <span />
    }
    return (
      <Redirect
        to={{
          pathname: "/dashboard",
        }}
      />
    );
  }

  return (
    <Row style={{ height: '100%', overflow: 'auto' }}>
      <Col span={24}>
        {
          address && <AdminBoard address={address} writeContracts={writeContracts} history={history} refreshSymbol={refreshCount} userProvider={userProvider} />
        }
        <Divider />
      </Col>

      <Col span={24} style={{ padding: 20 }}>
        {
          address && <StrategiesTable address={address} writeContracts={writeContracts} userProvider={userProvider} refreshSymbol={refreshCount} refreshCallBack={() => setRefreshCount(refreshCount + 1)} />
        }
      </Col>
      <Col span={24} style={{ padding: 20 }}>
        {
          address && <SettingTable writeContracts={writeContracts} userProvider={userProvider} refreshSymbol={refreshCount} refreshCallBack={() => setRefreshCount(refreshCount + 1)} />
        }
      </Col>
      <Col span={24} style={{ padding: 20 }}>
        <Card title={<span style={{ fontWeight: 'bold' }}>白名单设置</span>} bordered>
          <Row>
            <Col span={10}>
              <Input placeholder="请输入合约地址" value={blackAddress} onChange={handleAddressChange} />
            </Col>
            {
              blackAddress && <Col span={24}>
                <span style={{ color: blackAddressStatus ? 'green' : 'red' }}>
                  {blackAddressStatus ? `地址【${blackAddress}】已经在白名单中` : `地址【${blackAddress}】尚未加入白名单中`}
                </span>
              </Col>
            }
          </Row>
          <Row style={{ paddingTop: 20 }}>
            <Col span={24}>
              <Button type="primary" onClick={() => addToWhiteList(blackAddress)}>添加</Button>
              <Button type="primary" style={{ marginLeft: 20 }} onClick={() => removeFromWhiteList(blackAddress)}>移除</Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24} style={{ padding: 20 }}>
        <Card title={<span style={{ fontWeight: 'bold' }}>收益提取</span>} bordered>
          <Row>
            <Col span={10}>
              <Input placeholder="请输入收益接收地址" value={reciveAddress} onChange={event => setReciveAddress(event.target.value)} />
            </Col>
          </Row>
          <Row style={{ paddingTop: 20 }}>
            <Col span={24}>
              <Button type="primary" onClick={() => treasureWithdraw(reciveAddress)}>收益提取</Button>
            </Col>
          </Row>
        </Card>
      </Col>
      <Col span={24} style={{ padding: 20 }}>
        <Card title={<span style={{ fontWeight: 'bold' }}>系统管理</span>} bordered>
          <Row gutter={[3, 3]}>
            <Col span={24}>
              {
                isNil(adjustPositionPeriod)
                  ? '' : (
                    adjustPositionPeriod
                      ? <Popconfirm
                        placement="topLeft"
                        title={'确认立刻结束调仓？'}
                        onConfirm={() => setAdjustPosition(false)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button danger>
                          结束调仓
                        </Button>
                      </Popconfirm>
                      : <Popconfirm
                        placement="topLeft"
                        title={'确认立刻开启调仓？'}
                        onConfirm={() => setAdjustPosition(true)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button type="primary"  >
                          开启调仓
                        </Button>
                      </Popconfirm>
                  )
              }
              &nbsp;&nbsp;&nbsp;
              {
                isNil(status)
                  ? '' : (
                    status
                      ? <Popconfirm
                        placement="topLeft"
                        title={'确认立刻进行开启操作？'}
                        onConfirm={() => lock(false)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button type="primary">
                          开启
                        </Button>
                      </Popconfirm>
                      : <Popconfirm
                        placement="topLeft"
                        title={'确认立刻进行紧急关停操作？'}
                        onConfirm={() => lock(true)}
                        okText="是"
                        cancelText="否"
                      >
                        <Button danger >
                          紧急关停
                        </Button>
                      </Popconfirm>
                  )
              }
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
}

export default withRouter(Admin);
