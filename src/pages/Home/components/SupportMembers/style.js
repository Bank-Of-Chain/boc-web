const style = {
  main: {
    maxWidth: '68.75rem',
    padding: '8.125rem 0 11.5rem 0',
    margin: '0 auto'
  },
  title: {
    height: '5.625rem',
    lineHeight: '5.625rem',
    margin: 0,
    fontSize: '4.375rem',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
    '@media (max-width: 992px)': {
      fontSize: '2.5rem'
    }
  },
  members: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '4.375rem',
    borderBottom: '1px solid #888888',
    marginTop: '6.25rem'
  },
  membersSm: {
    paddingBottom: '3rem',
    borderBottom: '1px solid #888888'
  },
  member: {
    marginTop: '3rem',
    textAlign: 'center'
  },
  membersCenter: {
    marginTop: '4.375rem',
    textAlign: 'center'
  },
  buttonRow: {
    marginTop: '6.25rem',
    textAlign: 'center'
  }
}

export default style
