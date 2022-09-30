import isEqual from 'lodash/isEqual'

export const isProEnv = env => {
  return isEqual(env, 'pr-sg') || isEqual(env, 'pr02-sg')
}
