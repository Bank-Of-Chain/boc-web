import React from "react";
import useLookupAddress from "../../hooks/LookupAddress";

// changed value={address} to address={address}

/*
  ~ What it does? ~

  Displays an address with a blockie image and option to copy address

  ~ How can I use? ~

  <Address
    address={address}
    ensProvider={mainnetProvider}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
  - Provide fontSize={fontSize} to change the size of address text
*/
export default function Address(props) {
  const ens = useLookupAddress(props.ensProvider, props.address);

  let displayAddress = props.address.substr(0, 6);
  if (ens && ens.indexOf("0x") < 0) {
    displayAddress = ens;
  } else if (props.size === "short") {
    displayAddress += "..." + props.address.substr(-4);
  } else if (props.size === "long") {
    displayAddress = props.address;
  }
  return <span>{displayAddress}</span>;
}
