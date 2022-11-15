const style = {
  active: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    transition: 'all 0.3s linear'
  },
  logo: {
    position: 'relative',
    display: 'inline-block',
    '&:hover>:last-child': {
      opacity: 1
    }
  }
}

export default style
