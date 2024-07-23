import DropdownSelect from '../components/DropdownSelect'

export default {
  title: 'Form/DropdownSelect',
  component: DropdownSelect,
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
      options: ['left', 'right'],
      defaultValue: 'left',
    },
    disabled: {
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
  },
}

export const Template = (args) => (
  <DropdownSelect
    getOptions={(sendOptions) => {
      sendOptions([
        {
          value: 1,
          label: 'Option One',
        },
        {
          value: 2,
          label: 'Option Two',
        },
        {
          value: 3,
          label: 'Option Three Three Three',
        },
        {
          value: 4,
          label:
            'Option Four, Option Four, Option Four, Option Four, Option Four, Option Four, Option Four',
        },
        {
          value: 5,
          label: 'Option Five',
        },
      ])
    }}
    {...args}
  />
)
