import Divider from '../components/Divider'

export default {
  title: 'Layout/Divider',
  component: Divider,
  argTypes: {
    variant: {
      control: 'radio',
      options: [
        'primary',
        'secondary',
        'negative',
        'positive',
        'warning',
        'info',
      ],
      defaultValue: 'primary',
    },
    indention: {
      control: 'radio',
      options: [false, 'left', 'right', 'x', 'y', 'all'],
      defaultValue: false,
    },
  },
}

export const Template = (args) => <Divider {...args} />
