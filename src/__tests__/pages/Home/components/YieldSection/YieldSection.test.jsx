import React from 'react'
import { render } from '@testing-library/react'
import YieldSection from '@/pages/Home/components/YieldSection'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('YieldSection Component Render', () => {
    const { asFragment } = render(<YieldSection />)
    expect(asFragment()).toMatchSnapshot()
  })
})
