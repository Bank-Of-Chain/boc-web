import React, { useState } from 'react'

// === Components === //
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import GridContainer from '@/components/Grid/GridContainer'
import GridItem from '@/components/Grid/GridItem'

// === Utils === //
import { map } from 'lodash-es'

const CustomTabs = props => {
  const { tabs, contents, defaultKey = 0 } = props
  const [value, setValue] = useState(defaultKey)

  const handleTabChange = (event, newValue) => {
    setValue(newValue)
  }

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Tabs
          value={value}
          onChange={handleTabChange}
          TabIndicatorProps={{
            style: {
              minWidth: '160px',
              backgroundColor: '#d946ef'
            }
          }}
        >
          {map(tabs, (item, index) => {
            return <Tab key={index} label={item} />
          })}
        </Tabs>
      </GridItem>
      <GridItem xs={12} sm={12} md={12}>
        {map(contents, (item, index) => {
          return (
            <div key={index} className={value === index ? '' : 'hidden'}>
              {item}
            </div>
          )
        })}
      </GridItem>
    </GridContainer>
  )
}

export default CustomTabs
