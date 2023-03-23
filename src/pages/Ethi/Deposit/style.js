const componentsStyle = () => ({
  wrapper: {
    padding: '1.875rem',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%);'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '90px'
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
    margin: '0.25rem 0',
    display: 'flex',
    justifyContent: 'space-between'
  },
  estimateBalanceTitle: {
    fontSize: '1.625rem',
    margin: '0.75rem 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  estimateBalanceNum: {
    flex: 1,
    textAlign: 'right'
  },
  footerContainer: {
    marginTop: '0.625rem'
  },
  tokenInputWrapper: {
    marginTop: '1rem'
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
    height: '100%',
    alignItems: 'center'
  },
  tokenName: {
    fontSize: '1.625rem'
  },
  tokenLogo: {
    width: 30,
    borderRadius: '50%',
    marginRight: 8
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
    borderRadius: '1.25rem',
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
    display: 'flex',
    alignItems: 'center',
    height: '1rem',
    fontSize: '1rem'
  },
  toInfo: {
    display: 'flex',
    alignItems: 'center',
    height: '1.875rem',
    marginTop: '0.625rem',
    fontSize: '1rem'
  },
  usdiInfo: {
    margin: '0 0.625rem',
    fontSize: '1.5rem',
    fontWeight: 'bold'
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
  },
  balance: {
    display: 'flex',
    alignItems: 'center',
    color: '#BEBEBE'
  },
  tip: {
    marginTop: '0.75rem',
    fontSize: '0.75rem',
    color: '#BEBEBE'
  }
})

export default componentsStyle
