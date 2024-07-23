import Flex from '../components/Flex'

export default {
  title: 'Layout/Flex',
  component: Flex,
  argTypes: {
    direction: {
      control: 'radio',
      options: ['row', 'column'],
      defaultValue: 'row',
    },
    wrap: {
      control: 'radio',
      options: ['nowrap', 'wrap'],
      defaultValue: 'nowrap',
    },
    gap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
    rowGap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
    columnGap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
  },
}

export const Template = (args) => (
  <Flex {...args}>
    <span>Content 1</span>
    <span>Content 2</span>
    <span>Content 3</span>
    <span>Content 4</span>
    <span>Content 5</span>
    <span>Content 6</span>
  </Flex>
)
