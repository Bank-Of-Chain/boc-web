const componentsStyle = () => ({
  notConnect: {
    display: 'flex',
    flexDirection: 'column',
    height: '20rem',
    justifycontent: 'center',
    alignItems: 'center',
    borderRadius: '1.25rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)',
    fontSize: '1.25rem'
  },
  textBottom: {
    marginTop: '1rem'
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifycontent: 'center',
    marginLeft: '55px'
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
  },
  warning: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    borderRadius: '10px',
    justifycontent: 'flex-start'
  },
  title: {
    letterSpacing: '1px',
    fontSize: '0.75rem'
  },
  content: {
    letterSpacing: '2px'
  },
  apyText: {
    color: '#DB8332'
  },
  swapBody: {
    padding: '1rem'
  },
  swapItemWrapper: {},
  olItem: {
    paddingLeft: 0,
    margin: 0
  },
  liItem: {
    padding: '1rem',
    border: '1px solid #A68EFE',
    display: 'flex',
    alignItems: 'center',
    justifycontent: 'space-between',
    marginBottom: '1rem'
  },
  liTitle: {
    display: 'flex',
    alignItems: 'center',
    justifycontent: 'space-between'
  },
  value: {
    marginRight: '2rem'
  }
})

export default componentsStyle
