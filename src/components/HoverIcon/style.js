const style = {
  normal: {
    display: 'inline'
  },
  active: {
    display: 'none'
  },
  logo: {
    '&:hover .normal': {
      display: 'none'
    },
    '&::hover .active': {
      display: 'inline'
    }
  }
}

export default style
