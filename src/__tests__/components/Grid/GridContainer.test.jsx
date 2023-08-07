import React from 'react'
import { render } from '@testing-library/react'
import GridContainer from '@/components/Grid/GridContainer'

import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('GridContainer Component Render', () => {
    const { asFragment } = render(<GridContainer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
