import React from 'react'
import { render } from '@testing-library/react'
import AmmSection from '@/pages/Home/components/AmmSection'

test('AmmSection Component Render', () => {
  const { asFragment } = render(<AmmSection />)
  expect(asFragment()).toMatchSnapshot()
})
