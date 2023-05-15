import React from 'react'
import { render } from '@testing-library/react'
import Stepper from '@/components/Stepper/Stepper'
import StepConnector from '@/components/Stepper/StepConnector'
import StepIcon from '@/components/Stepper/StepIcon'
import StepLabel from '@/components/Stepper/StepLabel'

import { describe, expect, it } from 'vitest'

describe('xxxxxxxx', () => {
  it('Stepper Component Render', () => {
    const { asFragment } = render(<Stepper />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('StepConnector Component Render', () => {
    const { asFragment } = render(<StepConnector />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('StepIcon Component Render', () => {
    const { asFragment } = render(<StepIcon />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('StepLabel Component Render', () => {
    const { asFragment } = render(<StepLabel />)
    expect(asFragment()).toMatchSnapshot()
  })
})
