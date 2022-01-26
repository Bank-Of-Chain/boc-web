const productStyle = {
  section: {
    textAlign: "center",
    backgroundColor: 'rgba(12, 7, 53, .8)',
  },
  title: {
    fontSize: '1.5rem',
    color: '#fff',
    margin: 0
  },
  description: {
    fontSize: '0.875rem',
    color: '#fff',
    display: 'inline-block',
    lineHeight: '2rem'
  },
  item: {
    cursor: 'pointer',
    padding: '2.5rem',
    borderLeft: '1px solid rgba(255, 255, 255, .1)',
    '&:first-child': {
      borderLeft: 0
    }
  },
  checked: {
    backgroundColor: '#271f72',
    color: '#fff'
  }
};

export default productStyle;