const auditedStyle = {
  section: {
    color: '#1F2023',
    padding: '16rem 8.75rem',
    background: 'linear-gradient(180deg, #F6F6F6 30%, #E5DFF7 100%)'
  },
  sectionMobile: {
    color: '#1F2023',
    padding: '5rem 2.75rem',
    background: 'linear-gradient(180deg, #F6F6F6 30%, #E5DFF7 100%)'
  },
  title: {
    margin: 0,
    fontSize: '6.25rem',
    lineHeight: '8.125rem'
  },
  '@media screen and (max-width: 923px)': {
    title: {
      fontSize: '4.6rem',
      lineHeight: '6rem'
    }
  },
  text: {
    width: '34rem',
    margin: 0,
    lineHeight: '1.875rem',
    fontSize: '1.25rem',
    fontWeight: 'normal'
  },
  divider: {
    width: '18.75rem',
    height: '1px',
    margin: '1.875rem 0',
    background: '#1F2023'
  }
}

export default auditedStyle
