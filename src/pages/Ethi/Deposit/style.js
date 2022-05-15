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
  ethBalanceWrapper: {
    display: "flex",
    alignItems: "center"
  },
  labelToolTipIcon: {
    fontSize: 16,
    marginRight: 2
  },
  tooltip: {
    fontSize: 14,
    width: 186
  },
  gasPriceWrapper: {
    display: "flex",
    height: "32px",
    alignItems: "center",
    marginTop: 12
  },
});

export default componentsStyle;
