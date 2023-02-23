import React, { useEffect, useReducer } from 'react'

// === Components === //
import CircularProgress from '@material-ui/core/CircularProgress'
import Box from '@material-ui/core/Box'

const Circle = props => {
  const { size = 24, times = 30, duration = 3000 } = props
  const [value, forceUpdate] = useReducer(x => x + 1, 0)

  const every = duration / times

  useEffect(() => {
    forceUpdate()
    const timer = setInterval(forceUpdate, every)
    return () => clearInterval(timer)
  }, [forceUpdate, every])

  const current = times - (value % times)
  const percent = (100 / times) * current

  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress variant="determinate" size={size} value={percent} />
    </Box>
  )
}

export default Circle
