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
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem',
    padding: '2.6875rem 2.25rem'
  },
  estimateContainer: {
    border: '1px solid #A68EFD',
    marginTop: '0.5rem',
    borderBottomLeftRadius: '1rem',
    borderBottomRightRadius: '1rem',
    padding: '2.0625rem 2.6875rem'
  },
  estimateText: {
    color: '#A0A0A0',
    margin: 0,
    display: 'flex'
  },
  estimateBalanceTitle: {
    fontSize: '1.625rem'
  },
  estimateBalanceNum: {
    float: 'right',
    fontSize: '1rem'
  },
  footerContainer: {
    marginTop: '2.5rem'
  },
  tokenInputWrapper: {
    marginBottom: '16px'
  },
  inputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  input: {
    maxWidth: '12.5rem'
  },
  depositComfirmArea: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center'
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
    justifyContent: 'space-between',
    marginTop: '0.625rem'
  },
  token: {
    display: 'flex',
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '1.875rem',
    fontSize: '0.75rem'
  },
  toInfo: {
    display: 'flex',
    alignItems: 'center',
    height: '1.875rem',
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
    marginTop: '1.875rem',
    fontSize: '0.75rem'
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
