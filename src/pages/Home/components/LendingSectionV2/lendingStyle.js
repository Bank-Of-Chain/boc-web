const lendingSectionStyle = {
  section: {
    margin: '0 auto',
    padding: '3rem 0 11.5625rem 0',
    maxWidth: '68.75rem'
  },
  text: {
    color: '#1cd9ff'
  },
  title: {
    fontSize: '3.75rem'
  },
  item: {
    paddingLeft: 0,
    paddingRight: 0,
    width: '10%'
  },
  img: {
    cursor: 'pointer',
    filter: 'grayscale(100%)',
    '&:hover': {
      filter: 'grayscale(0%)'
    }
  },
  body: {
    height: '100%',
    marginLeft: 0,
    marginRight: 0
  },
  header: {
    height: '18.75rem',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  usdiBar: {
    background: '#7E6DD2',
    border: '2px solid #7E6DD2'
  },
  ethiBar: {
    background: '#CABBFF',
    border: '2px solid #CABBFF'
  },
  bar: {
    position: 'relative',
    width: '2.8125rem',
    cursor: 'pointer',
    borderRadius: '0.3rem',
    '&>p': {
      position: 'absolute',
      width: '100%',
      transform: 'translate(0, -3rem)',
      fontSize: '0.875rem',
      textAlign: 'center'
    },
    '&:last-child': {
      fontSize: '0.875rem'
    }
  },
  margin: {
    marginLeft: '0.3125rem'
  },
  fixed: {
    border: '2px solid #FE3DCE'
  },
  footer: {
    textAlign: 'center',
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    '&>img': {
      width: '3rem',
      height: '3rem',
      borderRadius: '1.5rem',
      marginTop: '1.875rem',
      transition: 'all 0.3s linear'
    },
    '&>p': {
      fontSize: '1rem',
      margin: 0
    }
  },
  label: {
    marginLeft: '1.875rem',
    '@media (max-width: 768px)': {
      marginLeft: '0.875rem'
    }
  },
  switchWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  symbolWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end'
  },
  box: {
    height: '1.375rem',
    width: '1.375rem',
    borderRadius: '50%',
    '@media (max-width: 768px)': {
      height: '1rem',
      width: '1rem'
    }
  },
  box1: {
    // for usdi current rate
    background: '#7E6DD2',
    border: '2px solid #7E6DD2'
  },
  box2: {
    // for usdi fixed rate
    background: '#7E6DD2',
    border: '2px solid #FE3DCE'
  },
  box3: {
    // for ethi current rate
    background: '#CABBFF',
    border: '2px solid #CABBFF'
  },
  box4: {
    // for ethi fixed rate
    background: '#CABBFF',
    border: '2px solid #FE3DCE'
  },
  chart: {
    background: 'linear-gradient(199.32deg, #FE3DCE 17.59%, #5B93DF 71.04%, #94E3FF 102.04%)',
    borderRadius: '1rem',
    padding: '2px'
  },
  chartInner: {
    backgroundColor: '#313036',
    borderRadius: '1rem'
  },
  wrapper: {
    padding: '3.75rem 2rem'
  },
  headerWrapper: {
    padding: '3.875rem 3.75rem 0'
  }
}

export const smStyle = {
  section: {
    padding: '3.5rem 3rem'
  },
  bar: {
    width: '1.8rem',
    '&>p': {
      fontSize: '0.8125rem'
    }
  },
  footer: {
    '&>img': {
      width: '1.8rem',
      height: '1.8rem',
      borderRadius: '0.9rem'
    },
    '&>p': {
      transform: 'rotateZ(45deg)',
      fontSize: '0.875rem',
      paddingBottom: '0.6rem',
      paddingLeft: '0.6rem',
      textAlign: 'left'
    }
  }
}

export default lendingSectionStyle
