import Form from '../components/Form'

export default {
  title: 'Form/Form',
  component: Form,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    submitOnEnter: {
      control: 'boolean',
      defaultValue: false,
    },
  },
}

export const Template = (args) => <Form {...args} />
