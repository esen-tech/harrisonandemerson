import React from 'react'

import Stepper from '../navigation/Stepper'

export default {
  title: 'ĒSEN/Stepper',
  component: Stepper,
}

export const StepperWithStripProgress = () => (
  <Stepper activeStep={1}>
    <Stepper.Step>
      <Stepper.StripProgress />
      Step 1
    </Stepper.Step>
    <Stepper.Step>
      <Stepper.StripProgress />
      Step 2
    </Stepper.Step>
    <Stepper.Step>
      <Stepper.StripProgress />
      Step 3
    </Stepper.Step>
  </Stepper>
)

export const StepperWithDotProgress = () => (
  <Stepper activeStep={1}>
    <Stepper.Step>
      Step 1
      <Stepper.DotProgress />
    </Stepper.Step>
    <Stepper.Step>
      Step 2
      <Stepper.DotProgress />
    </Stepper.Step>
    <Stepper.Step>
      Step 3
      <Stepper.DotProgress />
    </Stepper.Step>
    <Stepper.Step>
      Step 4
      <Stepper.DotProgress />
    </Stepper.Step>
  </Stepper>
)
