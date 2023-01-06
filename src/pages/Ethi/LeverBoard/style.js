const componentsStyle = () => ({
  notConnect: {
    display: 'flex',
    flexDirection: 'column',
    height: '20rem',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    fontSize: '1.25rem'
  },
  textBottom: {
    marginTop: '0.25rem'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  depositModal: {
    padding: '1.25rem',
    width: '35rem',
    color: 'rgba(255, 255, 255, 0.87)',
    border: '1px solid #A68EFE',
    backgroundColor: '#1f1d27',
    borderRadius: '2.5rem',
    outline: 0,
    '&:active': {
      outline: 'none'
    }
  },
  tooltip: {
    fontSize: '14px'
  }
})

export default componentsStyle
