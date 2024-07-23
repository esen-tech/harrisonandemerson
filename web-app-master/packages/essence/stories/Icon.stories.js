import Icon from '../components/Icon'

export default {
  title: 'Typography/Icon',
  component: Icon,
  argTypes: {
    fill: { control: 'boolean', defaultValue: true },
    size: {
      control: 'radio',
      options: ['l', 'm', 's', 'xs'],
      defaultValue: 'm',
    },
    sizeInPixel: { control: 'number', min: 20 },
    name: { control: 'text', defaultValue: 'calendar_month' },
  },
}

export const Template = (args) => <Icon {...args} />
