import Hyperlink from '../components/Hyperlink'
import Text from '../components/Text'

export default {
  title: 'Typography/Hyperlink',
  component: Hyperlink,
  argTypes: {
    disabled: {
      control: 'boolean',
      defaultValue: false,
    },
    href: {
      control: 'text',
      defaultValue: 'https://esenmedical.com',
    },
    children: {
      control: 'text',
      defaultValue: '點我到其他頁面',
    },
  },
}

export const Template = (args) => (
  <Text size="m">
    Lorem Ipsum is simply dummy text of the printing and typesetting industry.
    Lorem Ipsum has been the industry's standard dummy text ever since the
    1500s, when an unknown printer took a galley of type and scrambled it to
    make a type specimen book. It has survived not only five centuries, but also
    the leap into electronic typesetting, remaining essentially unchanged.
    <Hyperlink target="_blank" {...args} />
    It was popularised in the 1960s with the release of Letraset sheets
    containing Lorem Ipsum passages, and more recently with desktop publishing
    software like Aldus PageMaker including versions of Lorem Ipsum.
  </Text>
)
