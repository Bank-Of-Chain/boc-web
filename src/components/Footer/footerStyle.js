import { container } from '@/assets/jss/material-kit-react.js'

const footerStyle = {
  title: {
    display: 'block',
    marginTop: '0.5rem'
  },
  text: {
    color: '#888888'
  },
  item: {
    padding: '1.5rem 0'
  },
  '@media (max-width: 1200px)': {
    item: {
      padding: '1rem 0'
    }
  },
  block: {
    color: '#fff',
    padding: '0.9375rem',
    fontWeight: '500',
    textTransform: 'none',
    borderRadius: '3px',
    textDecoration: 'none',
    position: 'relative',
    display: 'block'
  },
  left: {
    textAlign: 'left'
  },
  right: {
    textAlign: 'right'
  },
  footer: {
    display: 'flex',
    zIndex: '2',
    position: 'relative',
    padding: '1.5rem 8.75rem 0'
  },
  '@media (max-width: 960px)': {
    footer: {
      padding: '0 3rem'
    }
  },
  footerWhiteFont: {
    '&,&:hover,&:focus': {
      color: '#FFFFFF'
    }
  },
  container: container,
  list: {
    padding: '0',
    margin: '0 -0.9375rem 0 0'
  },
  inlineBlock: {
    display: 'inline-block',
    padding: '0px',
    width: 'auto'
  },
  icon: {
    width: '18px',
    height: '18px',
    position: 'relative',
    top: '3px'
  },
  center: {
    textAlign: 'center'
  },
  disclaimer: {
    color: '#A0A0A0',
    textAlign: 'left',
    fontSize: '0.75rem',
    lineHeight: '1.375rem'
  },
  query: {
    color: '#BEBEBE'
  },
  email: {
    textDecoration: 'underline'
  },
  social: {
    height: '100%',
    paddingTop: '0.75rem',
    '& a + a': {
      marginLeft: '0.75rem'
    }
  }
}
export default footerStyle
