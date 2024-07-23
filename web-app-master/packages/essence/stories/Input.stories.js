import Input from '../components/Input'

export default {
  title: 'Form/Input',
  component: Input,
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
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    readOnly: {
      control: 'boolean',
      defaultValue: false,
    },
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    type: {
      control: 'radio',
      options: ['text', 'number', 'datetime-local'],
      defaultValue: 'text',
    },
    placeholder: {
      control: 'text',
      defaultValue: 'Placeholder',
    },
  },
}

export const Template = (args) => <Input {...args} />
