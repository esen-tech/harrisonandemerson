import Stack from '../components/Stack'

export default {
  title: 'Layout/Stack',
  component: Stack,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    fill: {
      control: 'boolean',
      defaultValue: false,
    },
    gap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
  },
}

export const Template = (args) => (
  <Stack {...args}>
    <span>Content 1</span>
    <span>Content 2</span>
    <span>Content 3</span>
    <span>Content 4</span>
    <span>Content 5</span>
    <span>Content 6</span>
  </Stack>
)
