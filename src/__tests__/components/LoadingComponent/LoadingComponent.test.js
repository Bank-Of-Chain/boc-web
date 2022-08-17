import React from 'react'
import { render } from '@testing-library/react'
import LoadingComponent from '@/components/LoadingComponent'

test('LoadingComponent Component Render', () => {
  const { asFragment } = render(<LoadingComponent>value</LoadingComponent>)
  expect(asFragment()).toMatchSnapshot()
})

test('LoadingComponent Component loading Render', () => {
  const { asFragment } = render(<LoadingComponent loading>value</LoadingComponent>)
  expect(asFragment()).toMatchSnapshot()
})
