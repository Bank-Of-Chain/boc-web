const componentsStyle = () => ({
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
    padding: '2.6875rem 2.25rem',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem'
  },
  estimateContainer: {
    border: '1px solid #A68EFD',
    marginTop: '0.5rem',
    borderBottomLeftRadius: '1rem',
    borderBottomRightRadius: '1rem',
    padding: '2.0625rem 2.6875rem'
  },
  estimateWrapper: {
    display: 'flex',
    marginTop: '1rem',
    justifyContent: 'space-between',
    fontSize: '1.625rem'
  },
  estimateText: {
    color: '#A0A0A0',
    margin: 0
  },
  estimateBalanceNum: {
    color: '#A0A0A0'
  },
  balance: {
    display: 'flex',
    color: '#A0A0A0',
    marginTop: '1rem'
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
  tokenInfo: {
    display: 'flex',
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
  depositModal: {
    padding: '1rem',
    maxWidth: '500px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#000',
    borderRadius: '1rem'
  },
  setting: {
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    cursor: 'pointer'
  },
  min: {
    marginTop: '1rem',
    color: '#A0A0A0',
    fontSize: '0.875rem'
  }
})

export default componentsStyle
