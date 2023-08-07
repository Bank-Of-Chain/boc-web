import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AmmSection from '@/pages/Home/components/AmmSection'
import { describe, expect, it } from 'vitest'

describe('AmmSection testcases', () => {
  it('AmmSection Component Render', () => {
    const { asFragment } = render(<AmmSection />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('tabs change with the content change', () => {
    const { container, getByText } = render(<AmmSection />)
    const tab1 = getByText('Stablecoins')
    const tab2 = getByText('Major Chain(s)')
    const tab3 = getByText('Protocols')

    expect(container.lastElementChild.children[3].lastElementChild.children.length).toBe(8)

    fireEvent.click(tab2)
    expect(container.lastElementChild.children[3].lastElementChild.children.length).toBe(1)

    fireEvent.click(tab3)
    expect(container.lastElementChild.children[3].lastElementChild.children.length).toBe(14)

    fireEvent.click(tab1)
    expect(container.lastElementChild.children[3].lastElementChild.children.length).toBe(8)
  })
})
