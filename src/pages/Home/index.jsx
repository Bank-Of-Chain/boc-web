import React from "react";
import { Row, Col, Button, Carousel, Image } from "antd";
import { Redirect } from "react-router-dom";

import image1 from "./images/bg-1.jpg";
import image2 from "./images/bg-2.jpg";

export default function Home(props) {
  const { loadWeb3Modal, web3Modal } = props;
  if (web3Modal.cachedProvider) {
    return (
      <Redirect
        to={{
          pathname: "/dashboard",
        }}
      />
    );
  }
  return (
    <Row>
      <Col span="24" style={{ padding: 20, textAlign: "right" }}>
        <Button type="primary" onClick={loadWeb3Modal}>
          Connect Wallet
        </Button>
      </Col>
      <Col span={24}>
        <Carousel autoplay style={{ textAlign: "center", zIndex: 0 }}>
          <Image preview={false} style={{ width: 100 }} src={image1} />
          <Image preview={false} style={{ width: 100 }} src={image2} />
        </Carousel>
      </Col>
    </Row>
  );
}
