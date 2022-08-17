import React from 'react'
import { render } from '@testing-library/react'
import LendingSection from '@/pages/Home/components/LendingSection'

test('LendingSection Component Render', () => {
  const { asFragment } = render(<LendingSection />)
  expect(asFragment()).toMatchSnapshot()
})
