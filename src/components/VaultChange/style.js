const style = {
  container: {
    padding: '3rem 0 1rem',
    display: 'flex',
    justifyContent: 'center'
  },
  wrapper: {
    width: '20rem',
    margin: '0 auto',
    '@media (max-width: 992px)': {
        width: '17rem'
    },
    '@media (max-width: 768px)': {
      width: '13rem'
    }
  },
  root: {
    textTransform: 'none'
  },
  tab: {
    color: '#fff'
  },
  indicator: {
    backgroundColor: '#A68EFE'
  },
  row: {
    width: '100%',
    position: 'relative',
    '&:first-child > div': {
      borderRight: 0
    }
  },
  item: {
    border: '2px solid #A68EFE',
    color: '#A68EFE',
    padding: '0.5rem',
    textAlign: 'center',
    position: 'relative',
    cursor: 'pointer',
    '&:not(:first-child)': {
      borderTop: 0
    }
  },
  checked: {
    color: '#313036',
    background: '#A68EFE',
    fontWeight: 'bold'
  }
}

export default style
