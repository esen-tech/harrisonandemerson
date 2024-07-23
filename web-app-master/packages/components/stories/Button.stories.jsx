import React from 'react'

import Button from '../Button'

export default {
  title: 'ĒSEN/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'danger'] },
    disabled: { control: { type: 'boolean' }, defaultValue: false },
    children: { control: { type: 'text' }, defaultValue: 'Button' },
  },
}

const Template = (args) => <Button {...args} />

export const PrimaryButton = Template.bind({})
PrimaryButton.args = {
  variant: 'primary',
}

export const LightButton = Template.bind({})
LightButton.args = {
  variant: 'light',
}

export const DangerButton = Template.bind({})
DangerButton.args = {
  variant: 'danger',
}
