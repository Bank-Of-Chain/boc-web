import React from 'react'

// === Components === //
import Tabs from '@/components/Tabs'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Deposit from '../../../InvestNew/Deposit'
import Withdraw from '../../../InvestNew/Withdraw'
import Info from '../Info/UsdiInfo'

const UsdiVault = props => {
  const { reload } = props
  return (
    <GridContainer className="b-1 border-rd-b-4 py-4 bg-truegray-900 mt-2">
      <GridItem xs={12} sm={12} md={12}>
        <Tabs
          tabs={['Deposit', 'Withdraw', 'Info']}
          contents={[<Deposit key="0" reload={reload} />, <Withdraw key="1" reload={reload} />, <Info key="2" />]}
        ></Tabs>
      </GridItem>
    </GridContainer>
  )
}

export default UsdiVault
