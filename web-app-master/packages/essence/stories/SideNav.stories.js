import SideNav from '../components/SideNav'

export default {
  title: 'Navigation/SideNav',
  component: SideNav,
  argTypes: {},
}

export const Template = (args) => (
  <SideNav {...args}>
    <SideNav.Header title="轉診" />
    <SideNav.Item icon={{ name: 'flight_takeoff' }} label="建立轉診單" />
    <SideNav.Item icon={{ name: 'flight_takeoff' }} label="建立轉診單" />
    <SideNav.Item icon={{ name: 'flight_takeoff' }} label="建立轉診單" active />
    <SideNav.Item icon={{ name: 'flight_takeoff' }} label="建立轉診單" />
  </SideNav>
)
