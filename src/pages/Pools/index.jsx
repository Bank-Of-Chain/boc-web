import React, { useState, useCallback } from 'react'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Components === //
import EthiVault from './components/Vault/EthiVault'
import UsdiVault from './components/Vault/UsdiVault'

// === Reducers === //

// === constants === //

// === Utils === //
import map from 'lodash/map'

const vaultArray = [
  {
    icon: '',
    name: 'Usd Vault',
    apy: 0.0782,
    tvl: 'tvl',
    depositAmount: 'depositAmount',
    txComponents: <UsdiVault />
  },
  {
    icon: '',
    name: 'Eth Vault',
    apy: 0.0782,
    tvl: 'tvl',
    depositAmount: 'depositAmount',
    txComponents: <EthiVault />
  }
]

const Pools = () => {
  const [openIndex, setOpenIndex] = useState(-1)

  /**
   *
   */
  const handleOpenClick = useCallback(
    index => {
      setOpenIndex(index === openIndex ? -1 : index)
    },
    [openIndex]
  )

  return (
    <div className="max-w-6xl color-white pt-13 px-20 pb-0 mt-24 mx-auto">
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <GridContainer style={{ width: '100%' }} className="b-1 border-rd-4 py-4 px-8 bg-dark-500 leh-3 text-center shadow-xl shadow-dark-900">
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">Vault</span>
            </GridItem>
            <GridItem xs={2} sm={2} md={2}>
              <span className="color-neutral-500">
                APY<span className="text-3">(Last 7 Days)</span>
              </span>
            </GridItem>
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">TVL</span>
            </GridItem>
            <GridItem xs={3} sm={3} md={3}>
              <span className="color-neutral-500">My Deposits</span>
            </GridItem>
            <GridItem xs={1} sm={1} md={1}></GridItem>
          </GridContainer>
          {map(vaultArray, (vault, index) => {
            const { name, apy, tvl, depositAmount, txComponents } = vault
            return (
              <GridContainer key={index}>
                <GridItem xs={12} sm={12} md={12}>
                  <GridContainer
                    style={{ width: '100%' }}
                    className="b-1 border-rd-4 py-4 px-8 bg-dark-500 mt-4 leh-3 text-center shadow-xl shadow-dark-900 cursor-pointer"
                    onClick={() => handleOpenClick(index)}
                  >
                    <GridItem xs={3} sm={3} md={3}>
                      {name}
                    </GridItem>
                    <GridItem xs={2} sm={2} md={2}>
                      <span className="color-fuchsia-700">{apy}</span>
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                      {tvl}
                    </GridItem>
                    <GridItem xs={3} sm={3} md={3}>
                      {depositAmount}
                    </GridItem>
                    <GridItem xs={1} sm={1} md={1}>
                      <div className={openIndex === index ? 'i-ep-arrow-up-bold' : 'i-ep-arrow-down-bold'}></div>
                    </GridItem>
                  </GridContainer>
                </GridItem>
                {openIndex === index && (
                  <GridItem xs={12} sm={12} md={12}>
                    {txComponents}
                  </GridItem>
                )}
              </GridContainer>
            )
          })}
        </GridItem>
      </GridContainer>
    </div>
  )
}

export default Pools
