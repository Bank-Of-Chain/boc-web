import React from 'react'
import { render } from '@testing-library/react'
import AmmSection from '@/pages/Home/components/AmmSection'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('AmmSection Component Render', () => {
    const { asFragment } = render(<AmmSection />)
    expect(asFragment()).toMatchSnapshot()
  })
})
