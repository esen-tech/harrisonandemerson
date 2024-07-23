import React from 'react'

import UnderlineTab from '../navigation/UnderlineTab'

export default {
  title: 'ĒSEN/UnderlineTab',
  component: UnderlineTab,
}

const Template = (args) => (
  <UnderlineTab {...args}>
    <UnderlineTab.Item active>UnderlineTab 1</UnderlineTab.Item>
    <UnderlineTab.Item>UnderlineTab 2</UnderlineTab.Item>
    <UnderlineTab.Item>UnderlineTab 2</UnderlineTab.Item>
  </UnderlineTab>
)

export const Primary = Template.bind({})
Primary.args = {}
