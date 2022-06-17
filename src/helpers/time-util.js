// === Utils === //
import parser from "cron-parser"
import min from "lodash/min"

// === Constants === //
import { DO_HARDWORK_CRON, DO_ALLOCATION_CRON } from "../constants/cron"

var options = {
  tz: "Asia/Shanghai",
}

/**
 * 获取最近的可能dohardwordk的时间戳
 */
export const getLastDohardworkTime = () => {
  const dohardworkCron = parser.parseExpression(DO_HARDWORK_CRON, options)
  const nextDohardworkTime = dohardworkCron.next().getTime()
  return nextDohardworkTime
}

/**
 * 获取最近的可能allocation的时间戳
 */
export const getLastAllocationTime = () => {
  const allocationCron = parser.parseExpression(DO_ALLOCATION_CRON, options)
  const nextAllocationTime = allocationCron.next().getTime()
  return nextAllocationTime
}

/**
 * 获取最近的可能rebase的时间戳
 */
export const getLastPossibleRebaseTime = () => {
  return min([getLastDohardworkTime(), getLastAllocationTime()])
}
