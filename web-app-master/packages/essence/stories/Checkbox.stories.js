import Checkbox from '../components/Checkbox'

export default {
  title: 'Form/Checkbox',
  component: Checkbox,
  argTypes: {
    children: {
      control: 'text',
      defaultValue: '我同意以上條款',
    },
  },
}

export const Template = (args) => <Checkbox {...args} />
