const componentsStyle = () => ({
  heart: {
    position: 'relative',
    margin: '0 1rem',
    animation: 'scale 1s linear infinite'
  },
  heartBefore: {
    position: 'absolute',
    width: '70%',
    height: '100%',
    backgroundColor: 'red',
    content: '',
    borderRadius: '50% 50% 0 0',
    left: 0,
    transform: 'rotate(-52deg)'
  },
  heartAfter: {
    position: 'absolute',
    width: '70%',
    height: '100%',
    backgroundColor: 'red',
    content: '',
    borderRadius: '50% 50% 0 0',
    right: 0,
    transform: 'rotate(49deg)'
  }
})

export default componentsStyle
