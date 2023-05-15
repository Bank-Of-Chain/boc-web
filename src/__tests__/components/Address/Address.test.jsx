import React from 'react'
import { render } from '@testing-library/react'
import Address from '@/components/Address/Address'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('Address Component Render', () => {
    const { asFragment } = render(<Address address="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" size="long" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
