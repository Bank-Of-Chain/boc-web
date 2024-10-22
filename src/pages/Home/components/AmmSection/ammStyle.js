const ammSectionStyle = {
  section: {
    textAlign: 'center',
    padding: '10rem 0 3.25rem',
    backgroundColor: '#313036',
    '& h2': {
      margin: '0',
      fontSize: '3.75rem',
      lineHeight: '4.375rem'
    }
  },
  iconContainer: {
    width: '52.5rem',
    padding: '5rem 0 0',
    margin: '0 auto',
    textAlign: 'center'
  },
  title: {
    width: '80%',
    maxWidth: '43rem',
    margin: '2.5rem auto',
    fontWeight: 'normal',
    fontSize: '1.25rem',
    lineHeight: '1.875rem'
  },
  item: {
    boxSizing: 'border-box',
    display: 'inline-block',
    width: '10.5rem',
    color: '#b2add1',
    cursor: 'pointer',
    padding: '0 1.5rem',
    textAlign: 'center'
  },
  onlyImg: {
    width: 'auto'
  },
  img: {
    height: '6rem',
    margin: '0.3rem',
    cursor: 'pointer',
    borderRadius: '50%',
    filter: 'grayscale(100%)',
    transition: 'all 0.3s linear',
    '&:hover': {
      filter: 'grayscale(0%)'
    }
  },
  transparentBg: {
    background: 'transparent'
  },
  text: {
    textAlign: 'center',
    margin: '0.625rem 0 3.75rem',
    fontSize: '1.5rem'
  },
  more: {
    cursor: 'pointer'
  },
  '@media screen and (max-width: 923px)': {
    iconContainer: {
      padding: '2rem 0 0'
    },
    text: {
      margin: '0.625rem 0 1.75rem'
    }
  }
}

export default ammSectionStyle
