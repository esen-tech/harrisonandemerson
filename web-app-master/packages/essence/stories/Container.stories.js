import Container from '../components/Container'

export default {
  title: 'Layout/Container',
  component: Container,
  argTypes: {
    size: {
      control: 'radio',
      options: ['xs', 's', 'm', 'l', 'xl', 'xxl'],
      defaultValue: 'm',
    },
    squished: {
      control: 'boolean',
      defaultValue: false,
    },
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    fill: {
      control: 'boolean',
      defaultValue: false,
    },
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
    children: {
      control: 'text',
      defaultValue:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
  },
}

export const Template = (args) => <Container {...args} />
