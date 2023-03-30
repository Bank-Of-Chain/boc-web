import React from 'react'
import { render } from '@testing-library/react'
import Stepper from '@/components/Stepper/Stepper'
import StepConnector from '@/components/Stepper/StepConnector'
import StepIcon from '@/components/Stepper/StepIcon'
import StepLabel from '@/components/Stepper/StepLabel'

test('Stepper Component Render', () => {
  const { asFragment } = render(<Stepper />)
  expect(asFragment()).toMatchSnapshot()
})

test('StepConnector Component Render', () => {
  const { asFragment } = render(<StepConnector />)
  expect(asFragment()).toMatchSnapshot()
})

test('StepIcon Component Render', () => {
  const { asFragment } = render(<StepIcon />)
  expect(asFragment()).toMatchSnapshot()
})

test('StepLabel Component Render', () => {
  const { asFragment } = render(<StepLabel />)
  expect(asFragment()).toMatchSnapshot()
})
