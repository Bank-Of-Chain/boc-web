import React from 'react'

// === Components === //
import Tabs from '@/components/Tabs'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Deposit from '../../../Ethi/Deposit'
import Withdraw from '../../../Ethi/Withdraw'
import Info from '../Info/EthiInfo'

const EthiVault = () => {
  return (
    <GridContainer className="b-1 border-rd-b-4 py-4 bg-truegray-900 mt-2">
      <GridItem xs={12} sm={12} md={12}>
        <Tabs tabs={['Deposit', 'Withdraw', 'Info']} contents={[<Deposit key="0" />, <Withdraw key="1" />, <Info key="2" />]}></Tabs>
      </GridItem>
    </GridContainer>
  )
}

export default EthiVault
