import React from 'react';
import { Menu, Dropdown, PageHeader, Tag } from "antd";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import Address from '../Address';

function UserBoard(props) {
  const { address, blockExplorer, mainnetProvider, logoutOfWeb3Modal } = props;

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
  </PageHeader>
}

export default UserBoard
