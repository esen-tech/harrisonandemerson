import Divider from '../components/Divider'
import Icon from '../components/Icon'
import Inline from '../components/Inline'
import Stack from '../components/Stack'
import StackItem from '../components/StackItem'
import Text from '../components/Text'
import WithSeparator from '../components/WithSeparator'

export default {
  title: 'Layout/WithSeparator',
  component: WithSeparator,
  argTypes: {
    leading: {
      control: 'boolean',
      defaultValue: false,
    },
    trailing: {
      control: 'boolean',
      defaultValue: false,
    },
    separator: {
      control: 'text',
      defaultValue: '|',
    },
  },
}

export const Template = (args) => (
  <WithSeparator {...args}>
    <span>Content 1</span>
    <span>Content 2</span>
    <span>Content 3</span>
    <span>Content 4</span>
    <span>Content 5</span>
    <span>Content 6</span>
  </WithSeparator>
)

export const BreadcrumLike = ({ separator, ...args }) => (
  <Inline alignItems="center" wrap="wrap">
    <WithSeparator {...args} separator={<Icon name="chevron_right" size="l" />}>
      <Text>Content 1</Text>
      <Text>Content 2</Text>
      <Text>Content 3</Text>
      <Text>Content 4</Text>
      <Text>Content 5</Text>
      <Text>Content 6</Text>
    </WithSeparator>
  </Inline>
)

export const ListLike = ({ separator, ...args }) => (
  <Stack>
    <WithSeparator {...args} separator={<Divider />}>
      <StackItem title="Content 1" />
      <StackItem title="Content 2" />
      <StackItem title="Content 3" />
      <StackItem title="Content 4" />
      <StackItem title="Content 5" />
      <StackItem title="Content 6" />
    </WithSeparator>
  </Stack>
)
