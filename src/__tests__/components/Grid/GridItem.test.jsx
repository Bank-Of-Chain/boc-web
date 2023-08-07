import React from 'react'
import { render } from '@testing-library/react'
import GridItem from '@/components/Grid/GridItem'

import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('GridItem Component Render', () => {
    const { asFragment } = render(<GridItem />)
    expect(asFragment()).toMatchSnapshot()
  })
})
