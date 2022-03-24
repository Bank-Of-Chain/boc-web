import {
  container,
} from "../../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  switchBar: {
    backgroundColor: '#91d5ff !important'
  },
  img: {
    width: '25px'
  },
  switchBase: {
    color: '#ddd'
  },
  switchChecked: {
    color: '#40a9ff'
  },
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBody: {
    textAlign: "center"
  },
  withdrawContainer: {
    padding: "36px 20px 0",
  },
  inputLabelWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  withdrawComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 24
  },
  selectorWrapper: {
    padding: '0 4px',
    marginTop: '8px'
  },
  settingBtn: {
    color: "#39d0d8",
    textAlign: "right",
    lineHeight: "36px",
    padding: "10px 0",
    marginRight: '16px'
  },
  settingTitle: {
    color: "#fff",
    fontSize: 16,
    letterSpacing: "0.01071em",
    lineHeight: 1.5,
    textAlign: 'center',
    width: '100%',
  },
  settingItem: {
    height: 38,
    lineHeight: '38px',
    marginBottom: 16,
    '&:first-child': {
      marginTop: 24
    }
  },
  settingItemLabel: {
    position: 'relative',
    minWidth: 100,
    marginRight: 16,
    textAlign: 'right'
  },
  maxLossFormCtrl: {
    width: "160px"
  },
  exchanged: {
    position: 'relative',
    paddingLeft: 16,
  },
  tooltip: {
    fontSize: '14px'
  },
  labelToolTipIcon: {
    position: 'absolute',
    left: 0,
    top: '50%',
    color: "#fff",
    fontSize: 16,
    transform: 'translate(0, -50%)'
  },
  slippageItem: {
    display: 'flex',
    alignItems: 'center'
  },
  slippageInput: {
    width: 96,
    marginLeft: 16
  },
  widthdrawLoadingPaper: {
    padding: 20,
    minWidth: 650,
    color: "rgba(255,255,255, 0.87)",
    border: "1px solid",
    background: "#150752",
  }
});

export default componentsStyle;
