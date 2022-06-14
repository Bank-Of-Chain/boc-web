import { container } from "../../../assets/jss/material-kit-react.js"

const componentsStyle = theme => ({
  container,
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    textAlign: "center",
  },
  depositContainer: {
    border: "1px solid #A68EFD",
    borderTopLeftRadius: "1rem",
    borderTopRightRadius: "1rem",
    padding: "2.6875rem 2.25rem",
  },
  estimateContainer: {
    border: "1px solid #A68EFD",
    marginTop: "0.5rem",
    borderBottomLeftRadius: "1rem",
    borderBottomRightRadius: "1rem",
    padding: "2.0625rem 2.6875rem",
  },
  estimateText: {
    color: "#A0A0A0",
    margin: 0,
  },
  estimateBalanceTitle: {
    fontSize: "1.625rem",
  },
  estimateBalanceNum: {
    float: "right",
    fontSize: "1rem",
  },
  footerContainer: {
    marginTop: "2.5rem",
  },
  tokenInputWrapper: {
    marginBottom: "16px",
  },
  inputLabelWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  input: {
    maxWidth: "12.5rem",
  },
  depositComfirmArea: {
    display: "flex",
    justifyContent: "space-between",
  },
  tokenInfo: {
    display: "flex",
    alignItems: "center",
  },
  tokenLogo: {
    width: 30,
    borderRadius: "50%",
    marginRight: 8,
  },
  tokenName: {
    fontSize: "16px",
    color: "#fff",
  },
  flexText: {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
  },
  ModalTokenLogo: {
    width: 25,
    borderRadius: "50%",
    margin: "0 8px",
  },
  labelToolTipIcon: {
    fontSize: 16,
  },
})

export default componentsStyle
