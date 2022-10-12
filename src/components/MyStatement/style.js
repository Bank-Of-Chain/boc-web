import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  lineChart: {
    minHeight: '20rem',
    paddingTop: '2rem'
  },
  barChart: {
    minHeight: '20rem',
    paddingTop: '2rem'
  },
  groupedOutlinedPrimary: {
    border: '2px solid #a0a0a0',
    color: '#fff',
    width: '7.5rem',
    height: '2.25rem',
    lineHeight: '2rem',
    '&:hover': {
      border: '2px solid #A68EFE'
    }
  },
  groupButtonCheck: {
    border: '2px solid #A68EFE'
  }
})

export default componentsStyle
