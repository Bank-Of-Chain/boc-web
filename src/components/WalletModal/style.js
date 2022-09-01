const style = {
  papar: {
    position: 'relative',
    top: '20%',
    width: 420,
    margin: '0 auto',
    padding: '36px',
    borderRadius: 12,
    color: 'rgba(255,255,255, 0.87)',
    background: '#292B2E',
    boxShadow: '0px 15px 15px rgba(0, 0, 0, 0.05)'
  },
  titleWrapper: {
    position: 'relative'
  },
  title: {
    fontSize: 20,
    fontWeight: 'normal',
    marginTop: 0,
    marginBottom: 24,
    color: '#fff'
  },
  cancelButton: {
    position: 'absolute',
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    cursor: 'pointer'
  },
  content: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  walletItemWrapper: {
    position: 'relative',
    width: '100%',
    padding: '14px 24px',
    marginBottom: 24,
    borderRadius: 4,
    justifyContent: 'flex-start',
    textTransform: 'none',
    fontSize: '16px',
    background: 'transparent',
    border: '2px solid #666666',
    boxShadow: 'none',
    '&:hover': {
      background: '#323438',
      boxShadow: 'none'
    },
    '&:focus': {
      background: '#323438',
      boxShadow: 'none'
    },
    '&:last-child': {
      marginBottom: 0
    },
    '&:after': {
      display: 'none',
      content: "''",
      position: 'absolute',
      top: '50%',
      right: 24,
      width: 8,
      height: 8,
      borderRadius: '50%',
      backgroundColor: '#55E752',
      transform: 'translate(0, -50%)'
    }
  },
  walletItem: {
    cursor: 'pointer'
  },
  walletItemWrapperSelected: {
    '&:after': {
      display: 'block'
    }
  },
  walletLogo: {
    width: 24,
    marginRight: 12,
    verticalAlign: 'middle'
  },
  walletName: {
    verticalAlign: 'middle',
    lineHeight: '24px'
  }
}

export default style
