import React from 'react'
import { render } from '@testing-library/react'
import CustomButtons from '@/components/CustomButtons/Button'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('CustomButtons Component Render', () => {
    const { asFragment } = render(<CustomButtons className="abc" />)
    expect(asFragment()).toMatchSnapshot()
  })
})
