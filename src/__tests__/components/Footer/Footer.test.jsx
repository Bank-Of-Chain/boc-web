import React from 'react'
import { describe, expect, test } from 'vitest'

import { render } from '@testing-library/react'
import Footer from '@/components/Footer/Footer'

describe('Accordion test', () => {
  test('should show title all the time', () => {
    const { asFragment } = render(<Footer />)
    expect(asFragment()).toMatchSnapshot()
  })
})
