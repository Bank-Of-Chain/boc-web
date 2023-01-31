import { useState, useCallback, useEffect } from 'react'

// === Utils === //
import * as ethers from 'ethers'
import map from 'lodash/map'
import isEmpty from 'lodash/isEmpty'
import compact from 'lodash/compact'

// === Constants === //
import { IERC20_ABI } from '@/constants'
import { ETH_ADDRESS } from '@/constants/tokens'

const useCreditAccount = (creditAddress, CREDIT_ADDRESS_ABI, userProvider) => {
  const [waitingForSwap, setWaitingForSwap] = useState([])
  const [collateralAmount, setCollateralAmount] = useState(ethers.BigNumber.from(0))
  const [borrowedAmount, setBorrowedAmount] = useState(ethers.BigNumber.from(0))
  /**
   *
   */
  const getWaitingForSwap = useCallback(() => {
    if (isEmpty(creditAddress) || isEmpty(CREDIT_ADDRESS_ABI) || isEmpty(userProvider)) return
    const creditAddressContract = new ethers.Contract(creditAddress, CREDIT_ADDRESS_ABI, userProvider)
    creditAddressContract.getWaitingForSwap().then(({ _assets, _amounts }) => {
      const nextWaitingForSwap = map(_assets, async (item, index) => {
        const amounts = _amounts[index]
        if (amounts.eq(0)) return
        if (item === ETH_ADDRESS) {
          return {
            address: item,
            decimals: 18,
            symbol: 'ETH',
            amounts: amounts.toString()
          }
        }
        const contract = new ethers.Contract(item, IERC20_ABI, userProvider)
        const decimals = await contract.decimals()
        const symbol = await contract.symbol()
        return {
          address: item,
          decimals,
          symbol,
          amounts: amounts.toString()
        }
      })
      Promise.all(nextWaitingForSwap).then(v => setWaitingForSwap(compact(v)))
    })
  }, [creditAddress, CREDIT_ADDRESS_ABI, userProvider])

  /**
   *
   */
  const getCollateralAmount = useCallback(() => {
    if (isEmpty(creditAddress) || isEmpty(CREDIT_ADDRESS_ABI) || isEmpty(userProvider)) return
    const creditAddressContract = new ethers.Contract(creditAddress, CREDIT_ADDRESS_ABI, userProvider)
    creditAddressContract.collateralAmount().then(setCollateralAmount)
  }, [creditAddress, CREDIT_ADDRESS_ABI, userProvider])

  /**
   *
   */
  const getBorrowedAmount = useCallback(() => {
    if (isEmpty(creditAddress) || isEmpty(CREDIT_ADDRESS_ABI) || isEmpty(userProvider)) return
    const creditAddressContract = new ethers.Contract(creditAddress, CREDIT_ADDRESS_ABI, userProvider)
    creditAddressContract.borrowedAmount().then(setBorrowedAmount)
  }, [creditAddress, CREDIT_ADDRESS_ABI, userProvider])

  useEffect(getWaitingForSwap, [getWaitingForSwap])

  useEffect(getCollateralAmount, [getCollateralAmount])

  useEffect(getBorrowedAmount, [getBorrowedAmount])

  return {
    collateralAmount,
    borrowedAmount,
    waitingForSwap,
    // actions
    getWaitingForSwap,
    getCollateralAmount
  }
}

export default useCreditAccount
