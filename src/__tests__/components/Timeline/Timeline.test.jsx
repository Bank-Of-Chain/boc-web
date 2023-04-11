import React from 'react'
import { render } from '@testing-library/react'
import Timeline from '@/components/Timeline'

test('Timeline Component Render', () => {
  const { asFragment } = render(<Timeline />)
  expect(asFragment()).toMatchSnapshot()
})
