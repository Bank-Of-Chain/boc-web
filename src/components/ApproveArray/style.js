import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  tokenLogo: {
    width: 30,
    borderRadius: '50%',
    marginRight: 8
  },
  approveContainer: {
    maxHeight: '400px'
  },
  approveItemWrapper: {
    margin: '0 1rem'
  },
  approveItem: {
    textAlign: 'left',
    display: 'flex'
  },
  approveButton: {
    margin: '12px 0 8px 8px'
  },
  input: {
    flex: 1
  },
  balanceText: {
    textAlign: 'left'
  },
  errorText: {
    color: '#ff7875'
  },
  errorContainer: {
    border: '1px solid #ff7875',
    margin: '2px'
  },
  reciveContainer: {
    background: 'linear-gradient(223.3deg, #A68EFD 20.71%, #F4ACF3 103.56%)'
  },
  left: {
    marginBottom: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  right: {
    width: '12.5rem'
  },
  slippage: {
    marginRight: '0.5rem'
  },
  select: {
    width: '90%',
    margin: '0 auto'
  },
  estimateContainer: {
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    minHeight: '10rem'
  },
  estimateBalance: {
    marginTop: '1rem',
    color: '#A0A0A0',
    fontSize: '18px'
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
  bottom: {
    padding: '0 10rem'
  },
  buttonGroup: {
    display: 'flex'
  },
  okButton: {
    flex: 3
  },
  cancelButton: {
    flex: 1,
    marginLeft: '1rem'
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
  }
})

export default componentsStyle
