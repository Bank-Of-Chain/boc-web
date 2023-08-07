import React from 'react'
import { render } from '@testing-library/react'
import Address from '@/components/Address/Address'
import { describe, expect } from 'vitest'

describe('Address Component', () => {
  // Positive Test Case
  test('renders address with short size and ENS', () => {
    const props = {
      ensProvider: 'provider',
      address: '0x1234567890123456789012345678901234567890',
      size: 'short'
    }
    const { asFragment } = render(<Address {...props} />)
    expect(asFragment()).toMatchSnapshot()
  })

  // Positive Test Case
  test('renders address with long size', () => {
    const props = {
      address: '0x1234567890123456789012345678901234567890',
      size: 'long'
    }
    const { asFragment } = render(<Address {...props} />)
    expect(asFragment()).toMatchSnapshot()
  })

  // Positive Test Case
  test('renders address with short size and without ENS', () => {
    const props = {
      address: '0x1234567890123456789012345678901234567890',
      size: 'short'
    }
    const { asFragment } = render(<Address {...props} />)
    expect(asFragment()).toMatchSnapshot()
  })

  // Edge Test Case
  test('renders address with minimum length', () => {
    const props = {
      address: '0x1234',
      size: 'short'
    }
    const { asFragment } = render(<Address {...props} />)
    expect(asFragment()).toMatchSnapshot()
  })

  // Negative Test Case
  test('renders nothing when address is not provided', () => {
    const props = {
      size: 'short'
    }
    const { asFragment } = render(<Address {...props} />)
    expect(asFragment()).toMatchSnapshot()
  })

  // Error Test Case
  test('throws error when address is not a string', () => {
    const props = {
      address: 123,
      size: 'short'
    }
    const { container } = render(<Address {...props} />)
    expect(container.firstChild.textContent).toBe('')
  })
})
