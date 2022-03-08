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
  item: {
    paddingLeft: 0,
    paddingRight: 0,
    '&:first-child $bar > p': {
      width: "6.123rem",
      left: "-3.125rem",
      textAlign: "right",
      top: "-4.0625rem",
      transform: 'none'
    }
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
      background: 'linear-gradient(180deg,#1cd9ff,#0073ff)',
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
    background: 'linear-gradient(180deg,#da6603,#6b520b)',
    '&:hover': {
      background: 'linear-gradient(180deg,#da9803,#6b680b)',
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
  }
};

export const smStyle = {
  section: {
    padding: '3.5rem 0.5rem'
  },
  item: {
    '&:first-child $bar >p': {
      left: "-4.125rem"
    }
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