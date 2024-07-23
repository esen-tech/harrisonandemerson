import React from 'react'

import Icon from '../Icon'

export default {
  title: 'ĒSEN/Icon',
  component: Icon,
  argTypes: {
    fill: { control: 'select', options: [0, 1], defaultValue: 1 },
    size: { control: { type: 'range', min: 20, max: 64 }, defaultValue: 24 },
    name: { control: { type: 'text' }, defaultValue: 'calendar_month' },
  },
}

const Template = (args) => <Icon {...args} />

export const FillCalendarMonthIcon = Template.bind({})
FillCalendarMonthIcon.args = {
  fill: 1,
  name: 'calendar_month',
}

export const NonFillCalendarMonthIcon = Template.bind({})
NonFillCalendarMonthIcon.args = {
  fill: 0,
  name: 'calendar_month',
}
