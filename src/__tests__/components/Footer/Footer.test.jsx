import React from 'react'
import { describe, expect, it } from 'vitest'

import { render } from '@testing-library/react'
import Footer from '@/components/Footer/Footer'

describe('Accordion test', () => {
  it('should show title all the time', () => {
    const { asFragment } = render(<Footer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
