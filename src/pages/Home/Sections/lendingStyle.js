const lendingSectionStyle = {
  section: {
    padding: '3.5rem'
  },
  text: {
    color: "#1cd9ff"
  },
  title: {
    margin: 0
  },
  item: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  body: {
    height: '20rem',
    marginLeft: 0,
    marginRight: 0
  },
  header: {
    height: '18.75rem',
    paddingLeft: 0,
    paddingRight: 0,
    borderBottom: '1px solid rgba(255, 255, 255, .1)',
    borderLeft: '1px solid rgba(255, 255, 255, .1)',
  },
  bar: {
    width: '3rem',
    background: 'linear-gradient(180deg,#0348da,#0b216b)',
    margin: 'auto',
    cursor: 'pointer',
    position: 'absolute',
    left: 0,
    bottom: 0,
    right: 0,
    '&:hover': {
      background: 'linear-gradient(180deg,#0348da,#0b216b)',
    },
    '&>p': {
      position: 'absolute',
      top: '-3rem',
      left: '50%',
      transform: 'translate(-50%, 0)',
      zIndex: 1,
      fontSize: '1rem'
    }
  },
  fixed: {
    background: 'linear-gradient(180deg,#1cd9ff,#3b5998)',
    '&:hover': {
      background: 'linear-gradient(180deg,#1cd9ff,#3b5998)',
    },
  },
  checked: {
    background: 'linear-gradient(180deg,#1cd9ff,#0073ff)',
    '&:hover': {
      background: 'linear-gradient(180deg,#1cd9ff,#0073ff)',
    },
  },
  footer: {
    paddingLeft: 0,
    paddingRight: 0,
    '&>img': {
      width: '3rem',
      height: '3rem',
      borderRadius: '1.5rem',
      marginTop: '1.25rem'
    },
    '&>p': {
      fontSize: '1rem'
    }
  },
  label: {
    float: 'right',
    textAlign: 'left',
    width: '6rem'
  },
  box: {
    height: '1rem',
    width: '1rem',
    marginRight: '0.25rem',
    display: 'inline-block',
    background: 'linear-gradient(180deg,#1cd9ff,#3b5998)',
  },
  box1: {
    height: '1rem',
    width: '1rem',
    marginRight: '0.25rem',
    display: 'inline-block',
    background: 'linear-gradient(180deg,#0348da,#0b216b)',
  },
  chart: {
    padding: "7.5rem 0",
    backgroundColor: 'rgba(255,255,255, 0.1)',
    border: '2px solid',
    borderRadius: '1rem',
    borderColor: 'chocolate'
  }
};

export const smStyle = {
  section: {
    padding: '3.5rem 0.5rem'
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

export default lendingSectionStyle;