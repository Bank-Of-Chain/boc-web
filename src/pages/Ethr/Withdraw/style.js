const componentsStyle = () => ({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalBody: {
    textAlign: 'center'
  },
  withdrawContainer: {
    padding: '2.6875rem 2.25rem',
    border: '1px solid #A68EFD',
    borderTopLeftRadius: '1rem',
    borderTopRightRadius: '1rem'
  },
  outputContainer: {
    padding: '2.6875rem 2.25rem',
    border: '1px solid #A68EFD',
    marginTop: '0.5rem',
    borderBottomLeftRadius: '1rem',
    borderBottomRightRadius: '1rem'
  },
  estimateText: {
    height: '1.25rem',
    color: '#A0A0A0',
    margin: 0,
    display: 'flex',
    marginTop: '0.5rem',
    alignItems: 'center'
  },
  input: {
    maxWidth: '12.5rem'
  },
  footerContainer: {
    marginTop: '2.5rem'
  },
  inputLabelWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center'
  },
  tokenName: {
    fontSize: '1.625rem'
  },
  widthdrawLoadingPaper: {
    padding: '1rem',
    maxWidth: '500px',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#000',
    borderRadius: '1rem',
    width: '100%'
  },
  estimateWrapper: {
    display: 'flex',
    marginTop: '1rem',
    justifyContent: 'space-between',
    fontSize: '1.625rem'
  },
  estimateBalanceNum: {
    color: '#A0A0A0'
  },
  setting: {
    position: 'absolute',
    right: '1rem',
    top: '1rem',
    cursor: 'pointer'
  },
  root: {
    padding: '1.5rem 0'
  }
})

export default componentsStyle
