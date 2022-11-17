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
    padding: '2.6875rem 2.25rem',
    background: '#1E1E1F'
  },
  estimateContainer: {
    border: '1px solid #A68EFD',
    marginTop: '0.625rem',
    borderBottomLeftRadius: '1.25rem',
    borderBottomRightRadius: '1.25rem',
    padding: '2.0625rem 2.6875rem',
    background: '#1E1E1F'
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
    marginTop: '0.625rem'
  },
  tokenInputWrapper: {
    marginBottom: '16px'
  },
  inputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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
  flexText: {
    display: 'inline-flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ModalTokenLogo: {
    width: 25,
    borderRadius: '50%',
    margin: '0 8px'
  },
  labelToolTipIcon: {
    fontSize: 16
  },
  depositModal: {
    padding: '1rem',
    maxWidth: '500px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#000',
    borderRadius: '1rem',
    '&:active': {
      outline: 'none'
    }
  },
  root: {
    padding: '1.5rem 0'
  },
  item: {
    paddingTop: '3rem'
  },
  subTitle: {
    color: '#A68EFE'
  },
  blockButton: {
    padding: '1.25rem 0',
    borderRadius: 20
  }
})

export default componentsStyle
