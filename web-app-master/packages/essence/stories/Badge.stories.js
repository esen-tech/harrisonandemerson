import Badge from '../components/Badge'
import Icon from '../components/Icon'

export default {
  title: 'Component/Badge',
  component: Badge,
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
    inversed: {
      control: 'boolean',
      defaultValue: true,
    },
    children: {
      control: 'text',
      defaultValue: '標籤',
    },
  },
}

export const Template = (args) => <Badge {...args} />

export const WithIcon = ({ children, ...args }) => (
  <Badge {...args}>
    <Icon name="military_tech" /> {children}
  </Badge>
)
