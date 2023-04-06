import React from 'react'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

const Info = props => {
  const { VAULT_ADDRESS, PEG_TOKEN_ADDRESS, HARESTER_ADDRESS } = props
  return (
    <GridContainer>
      <GridItem xs={6} sm={6} md={6}>
        <p className="flex justify-between items-center">
          <span className="color-neutral-500">vault:</span>
          <span className="color-fuchsia-700 cursor-pointer">{VAULT_ADDRESS}</span>
        </p>
        <p className="flex justify-between items-center">
          <span className="color-neutral-500">lp token:</span>
          <span className="color-fuchsia-700 cursor-pointer">{PEG_TOKEN_ADDRESS}</span>
        </p>
        <p className="flex justify-between items-center">
          <span className="color-neutral-500">harvester:</span>
          <span className="color-fuchsia-700 cursor-pointer">{HARESTER_ADDRESS}</span>
        </p>
      </GridItem>
      <GridItem xs={6} sm={6} md={6} className="pl-12">
        <p className="text-neutral-500">
          Vault is connected with a large number of high-quality strategies to provide stable returns. Different strategies bring different returns
          under various complex market conditions. BoC protocol will optimally allocate funds under different market conditions according to the
          positioning algorithm, bringing stable excess returns to users.
        </p>
        <p className="color-fuchsia-700 text-3 cursor-pointer">策略详情&gt;&gt;</p>
      </GridItem>
    </GridContainer>
  )
}

export default Info
