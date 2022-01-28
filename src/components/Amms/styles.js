const styles = {
  item: {
    display: 'inline-block',
    backgroundColor: '#2e217c',
    height: '3rem',
    lineHeight: '3rem',
    borderRadius: '1.5rem',
    width: '12.5rem',
    marginLeft: '1rem',
    marginBottom: '1.5rem',
    color: '#b2add1',
    textAlign: 'left',
    cursor: 'pointer',
    "&:hover": {
      background: 'linear-gradient(90deg, #1cd9ff, #0073ff)',
      color: '#fff'
    },
  },
  onlyImg:{
    width: 'auto',
  },
  img: {
    height: '2.4rem',
    margin: '0.3rem',
    borderRadius: '1.5rem',
    backgroundColor: '#fff',
  },
  text: {
    lineHeight: '3rem',
    verticalAlign: 'top',
    marginLeft: '0.5rem',
    color: '#fff',
    fontWeight: 'bold'
  },
  more: {
    cursor: 'pointer'
  }
}

export default styles