import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  lineChart: {
    minHeight: '20rem',
    paddingTop: '1.5rem'
  },
  barChart: {
    minHeight: '20rem',
    paddingTop: '1.5rem'
  },
  groupedOutlinedPrimary: {
    border: '2px solid #A68EFE',
    color: '#A68EFE',
    width: '7.5rem',
    height: '2.25rem',
    lineHeight: '2rem',
    '&:hover': {
      border: '2px solid #A68EFE'
    }
  },
  groupButtonCheck: {
    backgroundColor: '#A68EFE',
    color: '#FFFFFF',
    '&:hover': {
      backgroundColor: '#A68EFE'
    }
  }
})

export default componentsStyle
