import { ENV } from '@/constants'

export const isProEnv = () => {
  return ENV === 'pr-sg' || ENV === 'pr02-sg'
}
