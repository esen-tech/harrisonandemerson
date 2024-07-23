import Button from '../components/Button'
import Icon from '../components/Icon'

export default {
  title: 'Component/Button',
  component: Button,
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
    inversed: {
      control: 'boolean',
      defaultValue: true,
    },
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    loading: {
      control: 'boolean',
      defaultValue: false,
    },
    active: {
      control: 'boolean',
      defaultValue: false,
    },
    children: {
      control: 'text',
      defaultValue: 'Button',
    },
  },
}

export const Template = (args) => <Button {...args} />
export const WithPrefixIcon = (args) => (
  <Button prefix={<Icon size="l" name="arrow_back" />} {...args} />
)
export const WithSuffixIcon = (args) => (
  <Button suffix={<Icon size="l" name="arrow_forward" />} {...args} />
)
