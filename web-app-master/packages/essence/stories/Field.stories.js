import Field from '../components/Field'

export default {
  title: 'Form/Field',
  component: Field,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
  },
}

export const Template = (args) => <Field {...args} />
