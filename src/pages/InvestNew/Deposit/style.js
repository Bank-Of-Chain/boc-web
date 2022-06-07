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
    width: 30,
    borderRadius: "50%",
    marginRight: 8
  },
  tokenName: {
    fontSize: "16px",
    color: "#fff"
  },
  flexText:{
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ModalTokenLogo: {
    width: 25,
    borderRadius: "50%",
    margin: '0 8px'
  },
  labelToolTipIcon: {
    fontSize: 16,
  },
});

export default componentsStyle;
