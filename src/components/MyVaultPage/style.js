const componentsStyle = () => ({
  title: {
    textAlign: 'center',
    fontWeight: 'normal'
  },
  vaults: {
    display: 'flex',
    justifyContent: 'center'
  },
  vault: {
    padding: '2rem',
    borderRadius: '1rem',
    background: 'linear-gradient(111.68deg, rgba(87, 97, 125, 0.2) 7.59%, rgba(255, 255, 255, 0.078) 102.04%)'
  },
  vaultTitle: {
    textAlign: 'center',
    height: '203px'
  },
  icon: {
    height: '100%',
    borderRadius: '50%'
  },
  button: {
    width: '100%',
    marginTop: '1rem'
  },
  logo: {
    width: '30px',
    borderRadius: '50%'
  },
  checked: {
    border: '2px solid #A68EFD'
  },
  token: {
    display: 'flex',
    alignItems: 'center',
    marginTop: '1rem'
  },
  tokenInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center'
  },
  name: {
    marginLeft: '1rem'
  },
  input: {
    maxWidth: '14rem'
  },
  setting: {
    position: 'absolute',
    right: '0rem',
    top: '-0.5rem',
    cursor: 'pointer'
  },
  loading: {
    animation: 'loading 1s linear infinite'
  }
})

export default componentsStyle
