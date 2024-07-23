import Progress from '../components/Progress'

export default {
  title: 'Component/Progress',
  component: Progress,
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
      defaultValue: 'info',
    },
    type: {
      control: 'radio',
      options: ['strip', 'dot'],
      defaultValue: 'strip',
    },
    count: {
      control: 'number',
      defaultValue: 5,
    },
    now: {
      control: 'number',
      defaultValue: 2,
    },
  },
}

export const Template = (args) => <Progress {...args} />
