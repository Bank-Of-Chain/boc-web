import React from 'react'
import { render } from '@testing-library/react'
import GridContainer from '@/components/Grid/GridContainer'

test('GridContainer Component Render', () => {
  const { asFragment } = render(<GridContainer />)
  expect(asFragment()).toMatchSnapshot()
})
