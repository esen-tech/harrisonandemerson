import Backdrop from '../components/Backdrop'

export default {
  title: 'Overlay/Backdrop',
  component: Backdrop,
  argTypes: {
    show: {
      control: 'boolean',
      defaultValue: true,
    },
    children: {
      control: 'text',
      defaultValue: 'Content',
    },
  },
}

export const Template = (args) => <Backdrop {...args} />
