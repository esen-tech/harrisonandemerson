import Image from '../components/Image'

export default {
  title: 'Component/Image',
  component: Image,
  argTypes: {
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    width: {
      control: 'number',
      defaultValue: 300,
    },
    height: {
      control: 'number',
      defaultValue: 200,
    },
    rounded: {
      control: 'boolean',
      defaultValue: false,
    },
    alt: {
      control: 'text',
      defaultValue: 'A Dog Image',
    },
    src: {
      control: 'text',
      defaultValue: 'https://picsum.photos/id/237/300/200',
    },
  },
}

export const Template = ({ fluid, width, height, ...args }) => (
  <Image
    fluid={fluid}
    width={!fluid && width}
    height={!fluid && height}
    {...args}
  />
)
