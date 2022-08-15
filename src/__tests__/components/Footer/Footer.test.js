import React from 'react'
import { render } from '@testing-library/react'
import Footer from '@/components/Footer/Footer'

test('Footer Component Render', () => {
  const { asFragment } = render(<Footer />)
  expect(asFragment()).toMatchSnapshot()
})
