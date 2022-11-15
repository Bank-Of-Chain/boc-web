const style = {
  normal: {
    display: 'inline'
  },
  active: {
    display: 'none'
  },
  logo: {
    '&:hover>:first-child': {
      display: 'none'
    },
    '&:hover>:last-child': {
      display: 'inline'
    }
  }
}

export default style
