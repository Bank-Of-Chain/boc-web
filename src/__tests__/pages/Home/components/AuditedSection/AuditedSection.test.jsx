import React from 'react'
import { render } from '@testing-library/react'
import AuditedSection from '@/pages/Home/components/AuditedSection'
import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('AuditedSection Component Render', () => {
    const { asFragment } = render(<AuditedSection />)
    expect(asFragment()).toMatchSnapshot()
  })
})
