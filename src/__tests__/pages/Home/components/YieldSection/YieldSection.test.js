import React from 'react'
import { render } from '@testing-library/react'
import YieldSection from '@/pages/Home/components/YieldSection'

test('YieldSection Component Render', () => {
  const { asFragment } = render(<YieldSection />)
  expect(asFragment()).toMatchSnapshot()
})
