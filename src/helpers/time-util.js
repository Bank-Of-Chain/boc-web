// === Utils === //
import parser from "cron-parser";
import min from "lodash/min";

// === Constants === //
import { DO_HARDWORK_CRON, DO_ALLOCATION_CRON } from "../constants/cron";

var options = {
  tz: "Asia/Shanghai",
};

/**
 * get next dohardwork time 
 */
export const getLastDohardworkTime = () => {
  const dohardworkCron = parser.parseExpression(DO_HARDWORK_CRON, options);
  const nextDohardworkTime = dohardworkCron.next().getTime();
  return nextDohardworkTime;
};

/**
 * get next allocation time
 */
export const getLastAllocationTime = () => {
  const allocationCron = parser.parseExpression(DO_ALLOCATION_CRON, options);
  const nextAllocationTime = allocationCron.next().getTime();
  return nextAllocationTime;
};

/**
 * get next rebase time
 */
export const getLastPossibleRebaseTime = () => {
  return min([getLastDohardworkTime(), getLastAllocationTime()]);
};
