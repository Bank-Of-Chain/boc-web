import { container, primaryColor } from "@/assets/jss/material-kit-react.js";

const footerStyle = {
  title: {
    color: "#fff",
    textTransform: "none",
  },
  text: {
    color: "#A0A0A0",
  },
  item: {
    padding: "2rem 0",
    borderTop: "1px solid #a0a0a0",
  },
  "@media (max-width: 1200px)": {
    item: {
      padding: "1rem 0",
    },
  },
  block: {
    color: "#fff",
    padding: "0.9375rem",
    fontWeight: "500",
    textTransform: "none",
    borderRadius: "3px",
    textDecoration: "none",
    position: "relative",
    display: "block",
  },
  left: {
    float: "left!important",
    display: "block",
  },
  right: {
    padding: "15px 0",
    margin: "0",
    float: "right!important",
  },
  footer: {
    textAlign: "center",
    display: "flex",
    zIndex: "2",
    position: "relative",
    cursor: "pointer",
  },
  a: {
    color: primaryColor,
    textDecoration: "none",
    backgroundColor: "transparent",
  },
  footerWhiteFont: {
    "&,&:hover,&:focus": {
      color: "#FFFFFF",
    },
  },
  container: container,
  list: {
    marginBottom: "0",
    padding: "0",
    marginTop: "0",
  },
  inlineBlock: {
    display: "inline-block",
    padding: "0px",
    width: "auto",
  },
  icon: {
    width: "18px",
    height: "18px",
    position: "relative",
    top: "3px",
  },
  center: {
    color: "#707eac",
    fontSize: "14px",
    padding: "15px",
  },
};
export default footerStyle;
