const style = {
  container: {
    minWidth: '30rem',
    maxWidth: '68.75rem',
    width: '100%',
    margin: '6rem auto 0',
    color: '#FFFFFF',
    padding: '3rem',
    boxSizing: 'border-box'
  },
  title: {
    height: '8.125rem',
    lineHeight: '8.125rem',
    paddingTop: '3.125rem',
    margin: 0,
    fontSize: '6.25rem',
    '@media (max-width: 768px)': {
      fontSize: '3.12rem',
      lineHeight: '4rem',
      height: '4rem'
    }
  },
  description: {
    margin: '2.5rem 0 3.75rem',
    fontSize: '1.25rem'
  },
  subTitle: {
    height: '1.875rem',
    lineHeight: '1.875rem',
    marginBottom: '4.375rem',
    fontSize: '1.5625rem'
  },
  founders: {
    marginBottom: '4.375rem'
  },
  member: {
    boxSizing: 'border-box',
    display: 'inline-block',
    width: '13.4375rem',
    margin: '0 2rem 3.125rem 0'
  },
  avatar: {
    padding: '0 1.75rem',
    filter: 'grayscale(50%)',
    transition: 'all 0.3s',
    '&:hover': {
      filter: 'none'
    },
    '& img': {
      width: '100%',
      border: '5px solid #FFFFFF',
      borderRadius: '50%'
    }
  },
  label: {
    height: '1rem',
    lineHeight: '1rem',
    marginTop: '1.125rem',
    fontSize: '0.75rem',
    color: '#A68EFE',
    textAlign: 'center'
  },
  name: {
    height: '1.625rem',
    lineHeight: '1.625rem',
    marginTop: '0.25rem',
    fontSize: '1.25rem',
    textAlign: 'center'
  },
  social: {
    marginTop: '1rem',
    textAlign: 'center',
    '& a + a': {
      marginLeft: '0.625rem'
    }
  }
}

export default style
