import React, { useState, useEffect } from 'react';
import { Row, Menu, Dropdown, PageHeader, Tag, Statistic } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Address from '../Address';
import moment from 'moment';
import { BigNumber } from "ethers";

// === Utils === //
import { toFixed } from "./../../helpers/number-format"
import isEmpty from "lodash/isEmpty";

// === Hocs === //
import { useEventListener } from '../../hooks';

const { Countdown } = Statistic;

function UserBoard(props) {
  const { address, blockExplorer, mainnetProvider, writeContracts, logoutOfWeb3Modal, localProvider, readContracts } = props;

  const [userDebt, setUserDebt] = useState(BigNumber.from(0));
  const [inQueueWithdraw, setInQueueWithdraw] = useState(BigNumber.from(0));
  const [inQueueDeposit, setInQueueDeposit] = useState(BigNumber.from(0));
  const [usdtDecimals, setUsdtDecimals] = useState(BigNumber.from(1e6));
  const [perFullShare, setPerFullShare] = useState(BigNumber.from(1));
  const [underlyingUnit, setUnderlyingUnit] = useState(BigNumber.from(1));

  const now = moment();
  const lockDeadline = moment().hour(22).minute(0).second(0);
  if (lockDeadline.diff(now) < 0) {
    lockDeadline.add(1, 'days')
  }
  const harvestDeadline = moment().hour(23).minute(0).second(0);
  if (harvestDeadline.diff(now) < 0) {
    harvestDeadline.add(1, 'days')
  }
  const loadData = () => {
    if (isEmpty(address)) return;
    try {
      writeContracts.Vault.userDebt(address).then(setUserDebt).catch((e) => { });
      writeContracts.Vault.getPricePerFullShare().then(setPerFullShare).catch((e) => { });
      writeContracts.Vault.underlyingUnit().then(setUnderlyingUnit).catch((e) => { });
    } catch (error) {

    }
    return loadData;
  }

  const depositEvents = useEventListener(readContracts, "Vault", "Deposit", localProvider, 1);
  const withdrawEvents = useEventListener(readContracts, "Vault", "Withdraw", localProvider, 1);

  useEffect(() => {
    if (!isEmpty(depositEvents) || !isEmpty(withdrawEvents) || !isEmpty(address)) {
      loadData();
    }
  }, [address, depositEvents, withdrawEvents]);

  return <PageHeader
    title="Piggy.Finance"
    tags={<Tag color="blue">Running</Tag>}
    subTitle="个人看板"
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
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>投入成本</span>}
        // suffix="(USDT)"
        style={{
          marginLeft: 32,
          display: 'none'
        }}
        value={toFixed(userDebt, usdtDecimals)}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
      />
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>待提取份额</span>}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        style={{
          marginLeft: 32,
          display: 'none'
        }}
        value={toFixed(inQueueWithdraw, underlyingUnit)}
      />
      <Statistic
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>待处理存款</span>}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        style={{
          marginLeft: 32,
          display: 'none'
        }}
        // suffix="(USDT)"
        value={toFixed(inQueueDeposit, usdtDecimals)}
      />
      <Countdown
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>锁仓倒计时</span>}
        style={{
          marginLeft: 32,
          display: 'none'
        }}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={lockDeadline}
        format="H 时 m 分 s 秒"
      />
      <Countdown
        title={<span style={{ fontWeight: 'bold', color: '#000', fontSize: 'large' }}>倒计时</span>}
        style={{
          marginLeft: 32,
          display: 'none'
        }}
        valueStyle={{
          fontWeight: 'bold', color: '#000', fontSize: 'x-large'
        }}
        value={harvestDeadline}
        format="H 时 m 分 s 秒"
      />
    </Row>
  </PageHeader>
}

export default UserBoard
