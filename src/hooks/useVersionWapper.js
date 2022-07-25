import React from "react";

// === Constants === //
import { VAULTS } from "../constants";

// === Utils === //
import find from "lodash/find";
import resolver from "../services/abi-resolver";

export default function useVersionWapper(WrappedComponent, id) {
  const item = find(VAULTS, { id }) || {};
  const abi = resolver(item.abi_version);

  return (props) => {
    const nextProps = {
      ...abi,
      ...item,
      ...props,
    };
    return <WrappedComponent {...nextProps} />;
  };
}
