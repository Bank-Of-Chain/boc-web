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
    padding: "36px 16px 0",
  },
  inputLabelWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  depositComfirmArea: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 14
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center"
  },
  tokenLogo: {
    width: 30,
    borderRadius: "50%",
    marginRight: 8
  },
  tokenName: {
    fontSize: "16px",
    color: "#fff"
  },
  settingItemLabel: {
    marginRight: 16,
  },
});

export default componentsStyle;
