import { getLastAllocationTime, getLastDohardworkTime, getLastPossibleRebaseTime } from '@/helpers/time-util'

// === Utils === //
import moment from 'moment'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('getLastAllocationTime return correct time', () => {
    const text = getLastAllocationTime()
    // next Monday 7:00am at beijing timezone
    const nextAllocationTime = moment()
      .utcOffset(8)
      .startOf('week')
      .subtract(-8, 'day')
      .set('hour', 7)
      .set('minute', 0)
      .set('second', 0)
      .set('millisecond', 0)
    expect(text).toBe(nextAllocationTime.valueOf())
  })

  it('getLastDohardworkTime return correct time', () => {
    const text = getLastDohardworkTime()
    // next day 7:00am at beijing timezone
    const nextDohardworkTime = moment().utcOffset(8).subtract(-1, 'day').set('hour', 7).set('minute', 0).set('second', 0).set('millisecond', 0)
    expect(text).toBe(nextDohardworkTime.valueOf())
  })

  it('getLastPossibleRebaseTime return success', () => {
    const text = getLastPossibleRebaseTime()
    expect(text).toBeTruthy()
  })
})
