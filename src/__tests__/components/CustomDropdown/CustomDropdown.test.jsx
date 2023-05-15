import React from 'react'
import { render } from '@testing-library/react'
import CustomDropdown from '@/components/CustomDropdown/CustomDropdown'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('CustomDropdown Component Render', () => {
    const { asFragment } = render(<CustomDropdown hoverColor="primary" buttonProps={{ className: 'abc' }} buttonText="abc" buttonIcon="abc" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
