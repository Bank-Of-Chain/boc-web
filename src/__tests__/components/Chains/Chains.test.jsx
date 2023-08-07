import React from 'react'
import { render } from '@testing-library/react'
import Chains from '@/components/Chains/Chains'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('Chains Component Render', () => {
    const { asFragment } = render(<Chains />)
    expect(asFragment()).toMatchSnapshot()
  })
})
