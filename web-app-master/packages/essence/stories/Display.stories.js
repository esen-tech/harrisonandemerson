import Display from '../components/Display'

export default {
  title: 'Typography/Display',
  component: Display,
  argTypes: {
    variant: {
      control: 'radio',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'negative',
        'positive',
        'warning',
        'info',
      ],
      defaultValue: 'primary',
    },
    size: {
      control: 'radio',
      options: ['l', 'm', 's', 'xs'],
      defaultValue: 'm',
    },
    children: {
      control: 'text',
      defaultValue: 'Hello World',
    },
  },
}

export const Template = (args) => <Display {...args} />
