import {
  container,
} from "../../assets/jss/material-kit-react.js";

const componentsStyle = (theme) => ({
  container,
  center: {
    justifyContent: 'center',
    padding: '50px 72px 50px',
    backgroundColor: "#0c0735cc",
    [theme.breakpoints.down("md")]: {
      padding: '50px 16px 50px',
    },
    margin: 0
  },
  centerItem: {
    width: "630px"
  },
  balanceCard: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    textAlign: "center",
    marginBottom: 24,
    padding: "32px 16px",
    backgroundColor: "#271f72",
    color: "#fff",
    borderRadius: 6,
  },
  balanceCardValue: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 30,
    lineHeight: "30px",
    fontSize: 26,
    color: "#fff",
    marginBottom: 8
  },
  balanceCardLabel: {
    color: "#b2add1",
    fontSize: 14
  },
  tokenInfo: {
    display: "flex",
    position: "absolute",
    right: 12,
    top: 9
  },
  addTokenWrapper: {
    position: "relative",
    cursor: "pointer",
    marginRight: 12
  },
  addToken: {
    width: 24,
    height: "auto"
  },
  addTokenIcon: {
    position: "absolute",
    left: 14,
    top: 10
  },
  scanToken: {
    width: 24,
    height: "auto",
    cursor: "pointer",
    borderRadius: "50%",
    backgroundColor: "#fff"
  },
  hidden: {
    display: "none"
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
    marginTop: 130,
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
  investCard: {
    padding: "20px 24px",
    borderRadius: 6,
    backgroundColor: "rgba(39, 31, 114, 0.8)",
    overflow: "visible"
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
  detailWrapper: {
    margin: "42px 0 0 0"
  }
});

export default componentsStyle;
