import Spacer from '../components/Spacer'

export default {
  title: 'Layout/Spacer',
  component: Spacer,
  argTypes: {
    xSize: {
      control: 'radio',
      options: [false, 'xxl', 'xl', 'l', 'm', 's', 'xs'],
      defaultValue: false,
    },
    ySize: {
      control: 'radio',
      options: [false, 'xxl', 'xl', 'l', 'm', 's', 'xs'],
      defaultValue: false,
    },
  },
}

export const Template = (args) => <Spacer {...args} />
