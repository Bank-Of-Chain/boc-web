import { useEffect, useState, useReducer } from 'react'

// === Utils === //
import moment from 'moment'

const useTimeWait = (duration = 1000) => {
  const [initMoment, setInitMoment] = useState()
  const [, forceUpdate] = useReducer(x => x + 1, 0)

  useEffect(() => {
    setInitMoment(moment())
  }, [])

  useEffect(() => {
    forceUpdate()
    const timer = setInterval(forceUpdate, duration)
    return () => clearInterval(timer)
  }, [forceUpdate, duration])

  return {
    initMoment,
    fromNow: moment.utc(moment().diff(initMoment)).format('HH:mm:ss')
  }
}

export default useTimeWait
