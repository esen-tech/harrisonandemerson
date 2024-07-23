import Label from '../components/Label'

export default {
  title: 'Typography/Label',
  component: Label,
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
    align: {
      control: 'radio',
      options: ['left', 'center', 'right'],
      defaultValue: 'left',
    },
    pointer: {
      control: 'boolean',
      defaultValue: false,
    },
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    active: {
      control: 'boolean',
      defaultValue: false,
    },
    children: {
      control: 'text',
      defaultValue: 'Lorem Ipsum',
    },
  },
}

export const Template = (args) => <Label {...args} />
