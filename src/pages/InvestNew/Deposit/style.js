import {
  container,
} from "../../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    textAlign: "center"
  },
  depositContainer: {
    padding: "36px 20px 0",
  },
  tokenInputWrapper: {
    marginBottom: "16px",
  },
  inputLabelWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  depositComfirmArea: {
    display: "flex",
    justifyContent: "space-between",
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center"
  },
  tokenLogo: {
    width: 32,
    borderRadius: "50%",
    marginRight: 8
  },
  tokenName: {
    fontSize: "16px",
    color: "#fff"
  }
});

export default componentsStyle;
