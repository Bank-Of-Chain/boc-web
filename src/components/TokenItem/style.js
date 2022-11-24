import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  main: {
    padding: '2rem 3rem',
    color: '#A0A0A0',
    background: 'linear-gradient(111.68deg, #2C2F36 7.59%, #333437 102.04%)',
    borderRadius: '2.5rem'
  },
  title: {
    paddingBottom: '1.5rem',
    fontSize: '1.5rem',
    lineHeight: '1.5rem',
    textAlign: 'center'
  },
  tokenLogo: {
    width: 30,
    borderRadius: '50%',
    marginRight: 8
  },
  approveContainer: {
    maxHeight: '20rem',
    padding: '2rem 1.25rem',
    border: '1px solid #A68EFD',
    borderRadius: '0.5rem 0.5rem 0px 0px',
    backgroundColor: '#1F2023',
    overflowY: 'auto'
  },
  approveItemWrapper: {
    paddingBottom: '1rem',
    '&:last-child': {
      padding: 0
    }
  },
  success: {
    border: '1px solid forestgreen'
  },
  swappingContainer: {
    margin: 0,
    color: '#A68EFD',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '0.875rem'
  },
  swapSuccessContainer: {
    margin: 0,
    color: '#56CC8C',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '0.875rem'
  },
  swapErrorContainer: {
    height: '2rem',
    border: '1px solid #F36767',
    borderRadius: '0.625rem',
    margin: 0,
    color: '#F36767',
    textAlign: 'center',
    fontSize: '0.875rem',
    lineHeight: '2rem',
    cursor: 'pointer'
  },
  approveItem: {
    textAlign: 'left',
    display: 'flex'
  },
  approveButton: {
    margin: '12px 8px 8px'
  },
  balanceText: {
    textAlign: 'left',
    fontSize: '0.875rem',
    lineHeight: '0.875rem'
  },
  errorText: {
    color: '#ff7875'
  },
  errorContainer: {
    border: '1px solid #ff7875',
    margin: '2px 0'
  },
  successContainer: {
    border: '1px solid forestgreen',
    margin: '2px 0'
  },
  isSwappingContainer: {
    border: '1px solid #A68EFE',
    margin: '2px 0'
  },
  reciveContainer: {
    background: 'linear-gradient(223.3deg, #A68EFD 20.71%, #F4ACF3 103.56%)'
  },
  slippage: {
    padding: '0 1.25rem',
    border: '1px solid #A68EFD',
    borderRadius: '0px 0px 0.5rem 0.5rem',
    marginTop: '0.625rem',
    backgroundColor: '#1F2023'
  },
  slippageTitlte: {
    display: 'flex',
    alignItems: 'center'
  },
  estimateContainer: {
    padding: '2rem 1.25rem',
    border: '1px solid #A68EFD',
    marginTop: '0.625rem',
    backgroundColor: '#1F2023'
  },
  estimateTitle: {
    paddingBottom: '0.75rem'
  },
  estimateBalance: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  tokenList: {
    padding: '0.5rem',
    overflow: 'auto',
    border: '1px solid rgb(166, 142, 254)',
    borderRadius: '0.5rem'
  },
  arrow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  buttonGroup: {
    marginTop: '0.625rem'
  },
  okWrapper: {
    paddingLeft: '1rem'
  },
  okButton: {
    width: '100%'
  },
  cancelButton: {
    width: '100%'
  },
  addToken: {
    cursor: 'pointer'
  },
  swapError: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
    color: '#ff7875',
    textAlign: 'left'
  },
  textOverflow: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  loading: {
    animation: 'loading 1s linear infinite'
  },
  reloadIcon: {
    cursor: 'pointer',
    verticalAlign: 'text-bottom'
  }
})

export default componentsStyle
