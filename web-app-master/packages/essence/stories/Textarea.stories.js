import Textarea from '../components/Textarea'

export default {
  title: 'Form/Textarea',
  component: Textarea,
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
    placeholder: {
      control: 'text',
      defaultValue: 'Placeholder',
    },
    rows: {
      control: 'number',
      defaultValue: 5,
    },
  },
}

export const Template = (args) => <Textarea {...args} />
