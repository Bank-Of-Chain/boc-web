import React from 'react'
import { render } from '@testing-library/react'
import LoadingComponent from '@/components/LoadingComponent'

import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('LoadingComponent Component Render', () => {
    const { asFragment } = render(<LoadingComponent>value</LoadingComponent>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('LoadingComponent Component loading Render', () => {
    const { asFragment } = render(<LoadingComponent loading>value</LoadingComponent>)
    expect(asFragment()).toMatchSnapshot()
  })
})
