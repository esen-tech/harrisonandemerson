import React from 'react'

import Header from '../Header'

export default {
  title: 'ĒSEN/Header',
  component: Header,
}

const Template = (args) => <Header {...args} />

export const LevelOne = Template.bind({})
LevelOne.args = {
  level: 1,
  children: 'Header 1',
}

export const LevelTwo = Template.bind({})
LevelTwo.args = {
  level: 2,
  children: 'Header 2',
}

export const LevelThree = Template.bind({})
LevelThree.args = {
  level: 3,
  children: 'Header 3',
}
