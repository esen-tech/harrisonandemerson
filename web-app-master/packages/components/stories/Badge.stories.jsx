import React from 'react'

import Badge from '../Badge'

export default {
  title: 'ĒSEN/Badge',
  component: Badge,
  argTypes: {
    variant: {
      control: 'select',
      options: ['light', 'info', 'success', 'danger'],
    },
    children: { control: { type: 'text' }, defaultValue: 'Badge' },
  },
}

const Template = (args) => <Badge {...args} />

export const LightBadge = Template.bind({})
LightBadge.args = {
  variant: 'light',
}

export const InfoBadge = Template.bind({})
InfoBadge.args = {
  variant: 'info',
}

export const SuccessBadge = Template.bind({})
SuccessBadge.args = {
  variant: 'success',
}

export const DangerBadge = Template.bind({})
DangerBadge.args = {
  variant: 'danger',
}
