import Inline from '../components/Inline'

export default {
  title: 'Layout/Inline',
  component: Inline,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    gap: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
  },
}

export const Template = (args) => (
  <Inline {...args}>
    <span>Content 1</span>
    <span>Content 2</span>
    <span>Content 3</span>
    <span>Content 4</span>
    <span>Content 5</span>
    <span>Content 6</span>
  </Inline>
)
