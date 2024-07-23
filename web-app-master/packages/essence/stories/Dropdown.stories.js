import Button from '../components/Button'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'

export default {
  title: 'Component/Dropdown',
  component: Dropdown,
  argTypes: {},
}

export const Template = (args) => (
  <Dropdown {...args}>
    <Dropdown.Toggle>Click Me</Dropdown.Toggle>
    <Dropdown.Menu>Content Content Content</Dropdown.Menu>
  </Dropdown>
)

export const WithButton = (args) => (
  <Dropdown {...args}>
    <Dropdown.Toggle
      as={Button}
      variant="positive"
      suffix={<Icon size="l" name="arrow_drop_down" />}
    >
      Click Me
    </Dropdown.Toggle>
    <Dropdown.Menu>Content Content Content</Dropdown.Menu>
  </Dropdown>
)
