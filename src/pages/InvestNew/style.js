import { container } from '@/assets/jss/material-kit-react.js'
import { gradientText } from '@/assets/jss/common.js'

const componentsStyle = theme => ({
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    marginTop: 65,
    marginBottom: 100,
    ...container
  },
  center: {
    justifyContent: 'center',
    padding: '50px 72px 50px',
    backgroundColor: '#0c0735cc',
    [theme.breakpoints.down('md')]: {
      padding: '50px 16px 50px'
    },
    margin: 0
  },
  wrapper: {
    padding: '5rem 3rem',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)'
  },
  wrapperMobile: {
    padding: '3rem 2rem',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)'
  },
  deposit: {
    padding: '1rem',
    border: '1px solid #F4ACF3',
    borderTopLeftRadius: '1.25rem',
    borderTopRightRadius: '1.25rem'
  },
  symbol: {
    color: '#A68EFD',
    marginLeft: '1rem',
    ...gradientText
  },
  balance: {
    marginTop: '0.5rem',
    marginBottom: '2rem',
    padding: '1rem',
    border: '1px solid #F4ACF3',
    borderBottomLeftRadius: '1.25rem',
    borderBottomRightRadius: '1.25rem'
  },
  footer: {},
  item: {
    color: '#fff',
    marginBottom: 20,
    '& .MuiListItemIcon-root': {
      minWidth: '38px'
    }
  },
  centerItem: {
    width: '630px'
  },
  balanceCard: {
    position: 'relative',
    display: 'flex',
    marginTop: '0.5rem',
    alignItems: 'center',
    justifyContent: 'flex-start',
    textAlign: 'left',
    padding: '2.8125rem 2.4375rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    color: '#fff',
    borderRadius: '1.25rem'
  },
  check: {
    color: '#A68EFE'
  },
  balanceCardValue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 30,
    lineHeight: '30px',
    fontSize: 26,
    fontWeight: 'bold',
    fontFamily: 'DM Sans',
    color: '#fff',
    marginBottom: 8
  },
  balanceCardLabel: {
    color: '#b2add1',
    fontSize: 14
  },
  tokenInfo: {
    display: 'flex',
    position: 'absolute',
    right: 12,
    top: 9
  },
  addTokenIcon: {
    cursor: 'pointer',
    marginLeft: '1rem',
    display: 'flex'
  },
  scanToken: {
    width: 24,
    height: 'auto',
    cursor: 'pointer',
    borderRadius: '50%',
    backgroundColor: '#fff'
  },
  hidden: {
    display: 'none'
  },
  brand: {
    color: '#FFFFFF',
    textAlign: 'left'
  },
  title: {
    fontSize: '4.2rem',
    fontWeight: '600',
    display: 'inline-block',
    position: 'relative'
  },
  subtitle: {
    fontSize: '1.313rem',
    width: 'auto',
    margin: '10px 0 0'
  },
  main: {
    position: 'relative',
    backgroundColor: 'transparent'
  },
  mainRaised: {
    margin: '0 auto',
    marginTop: 65
  },
  link: {
    textDecoration: 'none'
  },
  textCenter: {
    textAlign: 'center'
  },
  switchBar: {
    backgroundColor: '#91d5ff !important'
  },
  img: {
    width: '25px'
  },
  radioUnchecked: {
    width: '0px',
    height: '0px',
    padding: '7px',
    border: '1px solid #fff',
    borderRadius: '50%'
  },
  radioChecked: {
    width: '16px',
    height: '16px',
    border: '1px solid #fff',
    borderRadius: '50%'
  },
  radioRoot: {
    padding: '12px',
    '&:hover': {
      backgroundColor: 'unset'
    }
  },
  radio: {
    color: '#fff !important'
  },
  investCard: {
    padding: '20px 24px',
    borderRadius: 6,
    backgroundColor: 'rgba(39, 31, 114, 0.8)',
    overflow: 'visible'
  },
  table: {
    backgroundColor: '#150752',
    border: '1px solid rgb(222, 217, 213)'
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    textAlign: 'center'
  },
  stepContainer: {
    padding: 20
  },
  stepItem: {
    color: '#fff'
  },
  tabsRoot: {
    padding: '0 20px'
  },
  tabsIndicator: {
    backgroundColor: 'transparent',
    display: 'flex',
    justifyContent: 'center',
    '& > span': {
      maxWidth: 120,
      width: '100%',
      backgroundColor: '#fff'
    }
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
    margin: '42px 0 0 0'
  },
  slider: {
    position: 'absolute',
    top: '50px',
    left: 'calc(50% - 33rem)',
    backgroundColor: '#271f72',
    color: 'azure'
  },
  text: {
    color: 'azure'
  },
  spliter: {
    display: 'flex',
    justifyContent: 'center',
    bottom: 0,
    height: 2,
    position: 'absolute',
    transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
    width: '54%',
    backgroundColor: '#fff'
  }
})

export default componentsStyle
