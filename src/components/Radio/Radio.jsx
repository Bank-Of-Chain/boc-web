import React from "react";
import { withStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";

const CustomRadio = withStyles({
  root: {
    color: "#fff",
    "&$checked": {
      color: "#40a9ff",
    },
  },
  checked: {},
})(props => {
  return <Radio color="default" {...props} />;
});

export default CustomRadio;
