import React from 'react'

// === Components === //
import Tabs from '@/components/Tabs'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'
import Deposit from '../../../Ethi/Deposit'
import Withdraw from '../../../Ethi/Withdraw'
import Info from '../Info'

// === Constants === //
import { ETHI_FOR_ETH, ETHI_VAULT as VAULT_ADDRESS, VAULT_BUFFER_FOR_ETHI_ETH as VAULT_BUFFER_ADDRESS } from '@/config/config'

const EthiVault = () => {
  return (
    <GridContainer className="b-1 border-rd-b-4 py-4 bg-truegray-900 mt-2">
      <GridItem xs={12} sm={12} md={12}>
        <Tabs
          tabs={['Deposit', 'Withdraw', 'Info']}
          contents={[
            <Deposit key="0" />,
            <Withdraw key="1" />,
            <Info key="2" VAULT_ADDRESS={VAULT_ADDRESS} PEG_TOKEN_ADDRESS={ETHI_FOR_ETH} HARESTER_ADDRESS={VAULT_BUFFER_ADDRESS} />
          ]}
        ></Tabs>
      </GridItem>
    </GridContainer>
  )
}

export default EthiVault
