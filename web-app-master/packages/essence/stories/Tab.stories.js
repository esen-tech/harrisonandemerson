import Tab from '../components/Tab'

export default {
  title: 'Component/Tab',
  component: Tab,
  argTypes: {
    type: {
      control: 'radio',
      options: ['underline', 'pill'],
      defaultValue: 'underline',
    },
    fluid: {
      control: 'boolean',
      defaultValue: false,
    },
    activeTabIndex: {
      control: 'number',
      defaultValue: 0,
    },
  },
}

export const Template = ({ activeTabIndex, ...args }) => {
  return (
    <Tab {...args}>
      <Tab.Item active={activeTabIndex == 0}>頁籤一</Tab.Item>
      <Tab.Item active={activeTabIndex == 1}>頁籤二</Tab.Item>
      <Tab.Item active={activeTabIndex == 2}>頁籤三</Tab.Item>
    </Tab>
  )
}
