export function getNoDataGraphic(hasdata = false) {
  if (hasdata) {
    return {}
  } else {
    return {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        silent: true, // not response for event
        invisible: false,
        style: {
          fill: '#9d9d9d',
          fontWeight: 'bold',
          text: 'No Data',
          fontSize: '25px'
        }
      }
    }
  }
}
