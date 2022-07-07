import { container } from "../../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  switchBar: {
    backgroundColor: "#91d5ff !important",
  },
  img: {
    width: "25px",
  },
  switchBase: {
    color: "#ddd",
  },
  switchChecked: {
    color: "#40a9ff",
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    textAlign: "center",
  },
  withdrawContainer: {
    padding: "2.6875rem 2.25rem",
    border: "1px solid #A68EFD",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
  },
  outputContainer: {
    padding: "2.6875rem 2.25rem",
    border: "1px solid #A68EFD",
    marginTop: "0.5rem",
    borderBottomLeftRadius: "1rem",
    borderBottomRightRadius: "1rem",
  },
  estimateText: {
    color: "#A0A0A0",
    margin: 0,
    display: "flex",
  },
  input: {
    maxWidth: "12.5rem",
  },
  footerContainer: {
    marginTop: "2.5rem",
  },
  inputLabelWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center",
  },
  tokenName: {
    fontSize: "1.625rem",
  },
  receiveTokenItem: {
    marginBottom: 0,
  },
  settingBtn: {
    color: "#39d0d8",
    textAlign: "right",
    lineHeight: "36px",
    padding: "10px 0",
    marginRight: "16px",
  },
  settingTitle: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: "0.01071em",
    lineHeight: 1.5,
    textAlign: "center",
    width: "100%",
  },
  settingItem: {
    height: 38,
    lineHeight: "38px",
    marginBottom: 16,
    "&:first-child": {
      marginTop: 24,
    },
  },
  settingItemLabel: {
    position: "relative",
    minWidth: 100,
    marginRight: 16,
    textAlign: "right",
  },
  mutedLabel: {
    position: "relative",
    display: "inline-block",
  },
  maxLossFormCtrl: {
    width: "160px",
  },
  exchanged: {
    position: "relative",
    paddingLeft: 16,
  },
  tooltip: {
    fontSize: "14px",
  },
  labelToolTipIcon: {
    position: "absolute",
    left: "-18px",
    top: "50%",
    color: "#fff",
    fontSize: 16,
    transform: "translate(0, -50%)",
  },
  slippageItem: {
    display: "flex",
    alignItems: "center",
  },
  slippageInput: {
    width: 96,
    marginLeft: 16,
  },
  widthdrawLoadingPaper: {
    padding: "1rem",
    maxWidth: "500px",
    color: "rgba(255, 255, 255, 0.87)",
    border: "1px solid #A68EFE",
    backgroundColor: "#000",
    borderRadius: "1rem",
  },
  estimateBalanceTitle: {
    fontSize: "1.625rem",
  },
  estimateBalanceNum: {
    float: "right",
    fontSize: "1rem",
  },
  estimateItem: {
    textAlign: "center",
    minHeight: "100px",
    color: "#A0A0A0",
    paddingTop: "35px",
  },
  setting: {
    position: "absolute",
    right: "1.2rem",
    top: "1.2rem",
    cursor: "pointer",
  },
  popover: {
    width: "15rem",
    background: "#292B2E",
    border: " 1px solid #666666",
    borderRadius: "1.25rem",
    padding: "1rem",
  },
  popoverTitle: {
    color: "#A0A0A0",
    margin: 0,
    padding: "0.5rem 0",
  },
  root: {
    padding: "1.5rem 0",
  },
});

export default componentsStyle;
