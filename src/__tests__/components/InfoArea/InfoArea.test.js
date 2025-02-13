import React from 'react'
import { render } from '@testing-library/react'
import InfoArea from '@/components/InfoArea/InfoArea'

test('InfoArea Component Render', () => {
  const { asFragment } = render(<InfoArea icon={<span>test</span>} title={'test'} description="description" />)
  expect(asFragment()).toMatchSnapshot()
})
