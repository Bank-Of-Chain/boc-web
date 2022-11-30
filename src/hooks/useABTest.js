// === Utils === //
import { useAsync } from 'react-async-hook'
import axios from 'axios'

const useABTest = () => {
  const data = useAsync(() => axios.get('/index.json'))
  if (data.loading) return {}
  return data?.result?.data
}

export default useABTest
