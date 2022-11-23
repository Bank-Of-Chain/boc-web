import { container } from '@/assets/jss/material-kit-react.js'

const landingPageStyle = {
  container: {
    zIndex: '12',
    color: '#FFFFFF',
    marginTop: '6rem',
    ...container
  },
  '@media (max-width: 960px)': {
    container: {
      marginTop: '84px'
    }
  },
  title: {
    fontSize: '9rem',
    width: '80%',
    margin: '0 auto',
    lineHeight: '9rem'
  },
  titleMobile: {
    fontSize: '6rem',
    width: '80%',
    margin: '0 auto',
    lineHeight: '6rem'
  },
  text: {
    margin: 0,
    textAlign: 'center',
    fontSize: '20px',
    lineHeight: '30px',
    fontWeight: 'normal'
  },
  invest: {
    width: '17.5rem',
    height: '3.625rem',
    fontSize: '1rem',
    textTransform: 'none'
  },
  grid: {
    padding: '4rem 0 15rem',
    textAlign: 'center',
    background: '#1F2023 url(/images/home/bg-line.png) no-repeat center'
  },
  gridMobile: {
    padding: '5rem 0',
    textAlign: 'center',
    background: '#1F2023 url(/images/home/bg-line.png) no-repeat center'
  },
  infoWrapper: {
    marginTop: '2.375rem',
    textAlign: 'center'
  },
  info: {
    display: 'inline-block',
    '& li': {
      display: 'inline-block'
    },
    '& li + li': {
      marginLeft: '5rem'
    }
  },
  infoTitle: {
    fontSize: '1.25rem'
  },
  infoText: {
    fontSize: '4.375rem',
    fontWeight: 'bold',
    color: '#A68EFD',
    backgroundImage: 'linear-gradient(90deg, #A68EFD 20%, #F4ACF3 80%)',
    backgroundSize: '200% 100%',
    '-webkit-background-clip': 'text',
    '-webkit-text-fill-color': 'transparent',
    animation: 'gradientText 4s linear infinite'
  }
}

export default landingPageStyle
