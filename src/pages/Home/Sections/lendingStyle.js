const lendingSectionStyle = {
  section: {
    textAlign: "center",
    backgroundColor: 'rgba(7, 12, 53, .8)',
    padding: '3.5rem'
  },
  text: {
    color: "#1cd9ff"
  },
  title: {
    margin: 0
  },
  body: {
    height: '20rem',
  },
  header: {
    height: '18.75rem',
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
      background: 'linear-gradient(180deg,#1cd9ff,#0073ff)',
    },
    '&>p': {
      position: 'absolute',
      top: '-3rem'
    }
  },
  checked: {
    background: 'linear-gradient(180deg,#1cd9ff,#0073ff)',
  },
  footer: {
    '&>img': {
      width: '3rem',
      borderRadius: '1.5rem',
      marginTop: '1.25rem'
    }
  }
};

export default lendingSectionStyle;