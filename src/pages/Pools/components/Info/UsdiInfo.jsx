import React from 'react'

// === Components === //
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Services === //
import { dashboardHost } from '@/helpers/location'

// === Utils === //
import { addToken } from '@/helpers/wallet'

// === Constants === //
import { USDI_FOR_ETH, USDI_VAULT_FOR_ETH } from '@/config/config'

const UsdiInfo = () => {
  return (
    <GridContainer>
      <GridItem xs={6} sm={12} md={6} className="pl-8 pr-12">
        <p className="flex justify-between items-center">
          <span className="color-neutral-500">Vault:</span>
          <a
            className="color-fuchsia-700 decoration-none text-3.5"
            rel="noopener noreferrer"
            href={`https://etherscan.io/address/${USDI_VAULT_FOR_ETH}`}
            target="_blank"
          >
            {USDI_VAULT_FOR_ETH}
          </a>
        </p>
        <p className="flex justify-between items-center">
          <span className="color-neutral-500">USDi:</span>
          <span className="i-ri-add-circle-fill color-fuchsia-700 cursor-pointer" onClick={() => addToken(USDI_FOR_ETH, 'USDi', 18)} />
          <a
            className="color-fuchsia-700 decoration-none text-3.5"
            rel="noopener noreferrer"
            href={`https://etherscan.io/address/${USDI_FOR_ETH}`}
            target="_blank"
          >
            {USDI_FOR_ETH}
          </a>
        </p>
      </GridItem>
      <GridItem xs={6} sm={12} md={6} className="pl-12" style={{ borderLeft: '1px solid #737373' }}>
        <p className="text-neutral-500">
          Vault is connected with a large number of high-quality strategies to provide stable returns. Different strategies bring different returns
          under various complex market conditions. BoC protocol will optimally allocate funds under different market conditions according to the
          positioning algorithm, bringing stable excess returns to users.
        </p>
        <a href={dashboardHost(1, 'usdi')} target="blank" className="color-fuchsia-700 text-3">
          Details &gt;&gt;
        </a>
      </GridItem>
    </GridContainer>
  )
}

export default UsdiInfo
