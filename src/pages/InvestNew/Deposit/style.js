import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    textAlign: 'center'
  },
  depositContainer: {
    border: '1px solid #A68EFD',
    borderTopLeftRadius: '1.25rem',
    borderTopRightRadius: '1.25rem',
    padding: '1.25rem',
    background: '#1E1E1F'
  },
  estimateContainer: {
    border: '1px solid #A68EFD',
    marginTop: '0.625rem',
    borderBottomLeftRadius: '1.25rem',
    borderBottomRightRadius: '1.25rem',
    padding: '1.25rem',
    background: '#1E1E1F'
  },
  estimateText: {
    color: '#A0A0A0',
    margin: 0,
    display: 'flex'
  },
  estimateBalanceTitle: {
    fontSize: '1.625rem',
    margin: '0.75rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  estimateBalanceNum: {
    width: '66.67%'
  },
  footerContainer: {
    marginTop: '0.625rem'
  },
  tokenInputWrapper: {
    marginTop: '1rem'
  },
  depositComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center',
    height: '100%'
  },
  tokenLogo: {
    width: 30,
    borderRadius: '50%',
    marginRight: 8
  },
  tokenName: {
    fontSize: '16px',
    color: '#A0A0A0'
  },
  ModalTokenLogo: {
    width: '1.875rem',
    borderRadius: '50%'
  },
  labelToolTipIcon: {
    fontSize: 16
  },
  depositModal: {
    padding: '1.25rem',
    width: '35rem',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#1f1d27',
    borderRadius: '2.5rem',
    outline: 0,
    '&:active': {
      outline: 'none'
    }
  },
  root: {
    padding: '1.25rem',
    borderRadius: '1.25rem 1.25rem 0 0',
    backgroundColor: '#313036'
  },
  item: {
    padding: '1.25rem',
    marginTop: '0.625rem',
    backgroundColor: '#313036',
    color: '#DADADA'
  },
  title: {
    height: '1rem',
    lineHeight: '1rem',
    fontSize: '1rem'
  },
  subTitle: {
    color: '#A68EFE'
  },
  blockButton: {
    padding: '1.25rem 0',
    borderRadius: 20
  },
  tokens: {
    display: 'flex',
    marginTop: '0.625rem'
  },
  token: {
    display: 'flex',
    width: '33.33%',
    alignItems: 'center'
  },
  name: {
    marginLeft: '0.625rem'
  },
  itemBottom: {
    padding: '1.25rem',
    borderRadius: '0 0 1.25rem 1.25rem',
    marginTop: '0.625rem',
    backgroundColor: '#313036',
    color: '#DADADA'
  },
  exchangeInfo: {
    height: '0.875rem',
    lineHeight: '0.875rem',
    fontSize: '0.875rem'
  },
  toInfo: {
    display: 'flex',
    alignItems: 'center',
    height: '1.875rem',
    marginTop: '0.625rem',
    fontSize: '1rem',
    fontWeight: 'bold'
  },
  usdiInfo: {
    marginLeft: '0.625rem',
    fontSize: '1.5rem'
  },
  timeInfo: {
    display: 'flex',
    alignItems: 'center',
    height: '1rem',
    lineHeight: '1rem',
    marginTop: '0.625rem',
    fontSize: '0.75rem',
    '& > svg': {
      fontSize: '0.75rem'
    }
  },
  time: {
    marginLeft: '0.625rem'
  },
  buttonGroup: {
    marginTop: '0.625rem',
    '& button + button': {
      marginLeft: '0.625rem'
    }
  },
  cancelButton: {
    width: '15rem',
    padding: '1.25rem 0',
    borderRadius: '1.25rem'
  },
  okButton: {
    width: '19.375rem',
    padding: '1.25rem 0',
    borderRadius: '1.25rem'
  }
})

export default componentsStyle
