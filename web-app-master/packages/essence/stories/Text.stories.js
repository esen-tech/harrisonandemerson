import Hyperlink from '../components/Hyperlink'
import Icon from '../components/Icon'
import Text from '../components/Text'

export default {
  title: 'Typography/Text',
  component: Text,
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
    pointer: {
      control: 'boolean',
      defaultValue: false,
    },
    truncated: {
      control: 'boolean',
      defaultValue: false,
    },
    multiLine: {
      control: 'boolean',
      defaultValue: true,
    },
    lineClamp: {
      control: 'number',
      defaultValue: 3,
    },
    align: {
      control: 'radio',
      options: ['left', 'center', 'right'],
      defaultValue: 'left',
    },
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    children: {
      control: 'text',
      defaultValue:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry.\n\nLorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.\n\nIt has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.\n\nIt was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  },
}

export const Template = ({ children, ...args }) => (
  <Text {...args}>
    {children}
    <Icon name="arrow_forward" />
  </Text>
)

export const Mixed = ({ children, ...args }) => (
  <Text {...args}>
    {children}
    <Hyperlink href="https://esenmedical.com" target="_blank">
      超連結
    </Hyperlink>
    {children}
    <Icon name="badge" />
    {children}
  </Text>
)
