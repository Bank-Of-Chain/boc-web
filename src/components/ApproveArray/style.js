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
  approveItem: {
    textAlign: 'left',
    margin: '0 1rem'
  },
  approveButton: {
    margin: '12px 0 8px 8px'
  },
  input: {
    width: '15rem'
  },
  balanceText: {
    textAlign: 'left',
    marginLeft: '1rem'
  },
  errorText: {
    color: 'red'
  },
  errorContainer: {
    border: '1px solid red',
    margin: '2px'
  },
  reciveContainer: {
    backgroundColor: 'rgba(255,255,255,0.87)'
  },
  left: {
    textAlign: 'left',
    marginLeft: '6rem'
  },
  right: {
    float: 'right',
    marginRight: '6rem'
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
    height: '23.75px'
  },
  tokenList: {
    overflow: 'auto',
    border: '1px solid rgb(166, 142, 254)',
    borderRadius: '1rem'
  }
})

export default componentsStyle
