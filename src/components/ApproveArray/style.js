import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  tokenLogo: {
    width: 30,
    borderRadius: '50%',
    marginRight: 8
  },
  approveContainer: {
    maxHeight: '500px'
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
    border: '1px solid red'
  },
  reciveContainer: {
    backgroundColor: 'rgba(255,255,255,0.87)'
  },
  left: {
    textAlign: 'left'
  },
  right: {
    textAlign: 'right'
  },
  select: {
    width: 'auto'
  }
})

export default componentsStyle
