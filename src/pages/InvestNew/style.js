import {
  container,
  dangerColor,
} from "../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  center: {
    justifyContent: 'center',
    padding: '0 72px 50px',
    [theme.breakpoints.down("md")]: {
      padding: '0 16px 50px',
    }
  },
  centerItem: {
    width: "630px"
  },
  brand: {
    color: "#FFFFFF",
    textAlign: "left"
  },
  title: {
    fontSize: "4.2rem",
    fontWeight: "600",
    display: "inline-block",
    position: "relative",
  },
  subtitle: {
    fontSize: "1.313rem",
    width: 'auto',
    margin: "10px 0 0",
  },
  main: {
    position: "relative",
    backgroundColor: 'transparent'
  },
  mainRaised: {
    margin: "0 auto",
    marginTop: 250,
    marginBottom: 100,
    borderRadius: "6px",
  },
  link: {
    textDecoration: "none",
  },
  textCenter: {
    textAlign: "center",
  },
  switchBar: {
    backgroundColor: '#91d5ff !important'
  },
  img: {
    width: '25px'
  },
  radioUnchecked: {
    width: "0px",
    height: "0px",
    padding: "7px",
    border: "1px solid #fff",
    borderRadius: "50%",
  },
  radioChecked: {
    width: "16px",
    height: "16px",
    border: "1px solid #fff",
    borderRadius: "50%",
  },
  radioRoot: {
    padding: "12px",
    "&:hover": {
      backgroundColor: "unset",
    },
  },
  radio: {
    color: "#fff !important",
  },
  table: {
    backgroundColor: '#150752',
    border: '1px solid rgb(222, 217, 213)',
  },
  tableCell: {
    color: '#fff',
    fontSize: '12px',
    letterSpacing: '0.01071em'
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
  stepContainer: {
    padding: 20
  },
  stepItem: {
    color: '#fff'
  },
  tabsRoot: {
    padding: "0 20px",
  },
  tabsIndicator: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    '& > span': {
      maxWidth: 120,
      width: '100%',
      backgroundColor: '#fff',
    },
  },
  tabTextColor: {
    color: '#fff'
  },
  tabRoot: {
    width: '50%',
    fontSize: '16px',
    maxWidth: 'none'
  },
  valutMainContainer: {
    padding: "36px 20px 0",
  },
  mainInputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  depositComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 24
  },
  withdrawComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 24
  },
  textField: {
    width: '100%',
    margin: "12px 0 8px",
    '& .MuiInputBase-root': {
      color: '#fff',
      borderRadius: '6px',
    },
    '& ..MuiOutlinedInput-input': {
      padding: '16px 14px',
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: '#fff'
    },
    '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
      borderWidth: '1px',
      borderColor: dangerColor
    },
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
  settingItem: {
    height: 38,
    lineHeight: '38px',
    marginBottom: 16,
    '&:first-child': {
      marginTop: 24
    }
  },
  settingLabel: {
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
  }
});

export default componentsStyle;