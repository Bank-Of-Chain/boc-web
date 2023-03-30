import React from 'react'
import { render } from '@testing-library/react'
import RoadMapSection from '@/pages/Home/components/RoadMapSection'

test('RoadMapSection Component Render', () => {
  const { asFragment } = render(<RoadMapSection />)
  expect(asFragment()).toMatchSnapshot()
})
