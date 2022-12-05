import { container } from '@/assets/jss/material-kit-react.js'

const componentsStyle = () => ({
  container,
  lineChart: {
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
  },
  unit: {
    margin: '0 0.5rem',
    backgroundImage: 'linear-gradient(223.3deg,#a68efd 20.71%,#f4acf3 103.56%)',
    '-webkitBackgroundClip': 'text',
    textFillColor: 'transparent',
    fontWeight: 'bold'
  },
  addTokenIcon: {
    marginLeft: '0.625rem',
    fontSize: '1.5rem',
    cursor: 'pointer',
  }
})

export default componentsStyle
