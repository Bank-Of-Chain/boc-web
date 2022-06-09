import {
  primaryColor,
  warningColor,
  dangerColor,
  successColor,
  infoColor,
  roseColor,
  grayColor,
  title,
} from "../../assets/jss/material-kit-react.js"

const infoStyle = {
  iconWrapper: {
    float: "left",
    marginTop: "24px",
    marginRight: "10px",
  },
  primary: {
    color: primaryColor,
  },
  warning: {
    color: warningColor,
  },
  danger: {
    color: dangerColor,
  },
  success: {
    color: successColor,
  },
  info: {
    color: infoColor,
  },
  rose: {
    color: roseColor,
  },
  gray: {
    color: grayColor,
  },
  icon: {
    width: "36px",
    height: "36px",
  },
  descriptionWrapper: {
    color: grayColor,
    overflow: "hidden",
  },
  title: {
    ...title,
    color: "#fff",
    fontSize: "1.5rem",
  },
  description: {
    color: "#fff",
    overflow: "hidden",
    marginTop: "0px",
    fontSize: "14px",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    lineHeight: "1.5em",
    textAlign: "left",
  },
  iconWrapperVertical: {
    float: "none",
  },
  iconVertical: {
    width: "61px",
    height: "61px",
  },
}

export default infoStyle
