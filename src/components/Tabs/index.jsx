import React, { useState } from 'react'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import TabPanel from '@/components/TabPanel'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Utils === //
import { map } from 'lodash'

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`
  }
}

const CustomTabs = props => {
  const { tabs, contents, defaultKey = 0 } = props
  const [value, setValue] = useState(defaultKey)

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Tabs value={value} onChange={handleTabChange}>
          {map(tabs, (item, index) => {
            return <Tab key={index} label={item} {...a11yProps(index)} />
          })}
        </Tabs>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        {map(contents, (item, index) => {
          return (
            <TabPanel key={index} value={value} index={index}>
              {item}
            </TabPanel>
          )
        })}
      </GridItem>
    </GridContainer>
  )
}

export default CustomTabs
