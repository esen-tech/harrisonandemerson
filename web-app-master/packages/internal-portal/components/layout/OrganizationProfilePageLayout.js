import SideNav from '@esen/essence/components/SideNav'
import Spacer from '@esen/essence/components/Spacer'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { useRouter } from 'next/router'
import OrganizationPageLayout from './OrganizationPageLayout'

const OrganizationProfilePageLayout = (props) => {
  const router = useRouter()
  const leftNavigation = (
    <WithSeparator leading separator={<Spacer ySize="l" />}>
      <SideNav>
        <SideNav.Header title="病歷管理" />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="病歷資料"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/profiles'
          )}
        />
      </SideNav>
    </WithSeparator>
  )
  return <OrganizationPageLayout leftNavigation={leftNavigation} {...props} />
}

export default OrganizationProfilePageLayout
