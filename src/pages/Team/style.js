const style = {
  container: {
    width: '68.75rem',
    margin: '6rem auto 0',
    color: '#FFFFFF'
  },
  title: {
    height: '8.125rem',
    lineHeight: '8.125rem',
    margin: 0,
    fontSize: '6.25rem'
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
    marginBottom: '7.5rem'
  },
  member: {
    boxSizing: 'border-box',
    display: 'inline-block',
    width: '13.4375rem',
    margin: '0 5rem 3.125rem 0',
    '&:nth-child(4n)': {
      margin: '0 0 3.125rem 0'
    }
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
      borderRadius: '50%',
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
    '& svg + svg': {
      marginLeft: '0.625rem'
    }
  }
}

export default style
