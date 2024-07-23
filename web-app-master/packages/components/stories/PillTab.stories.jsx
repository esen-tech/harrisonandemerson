import React from 'react'

import PillTab from '../navigation/PillTab'

export default {
  title: 'ĒSEN/PillTab',
  component: PillTab,
}

const Template = (args) => (
  <PillTab>
    <PillTab.Item active>PillTab 1</PillTab.Item>
    <PillTab.Item>PillTab 2</PillTab.Item>
  </PillTab>
)

export const Primary = Template.bind({})
Primary.args = {
  variant: 'primary',
}
