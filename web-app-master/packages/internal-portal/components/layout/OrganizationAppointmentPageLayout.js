import SideNav from '@esen/essence/components/SideNav'
import Spacer from '@esen/essence/components/Spacer'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { useRouter } from 'next/router'
import OrganizationPageLayout from './OrganizationPageLayout'

const OrganizationAppointmentPageLayout = (props) => {
  const router = useRouter()

  const leftNavigation = (
    <WithSeparator leading separator={<Spacer ySize="l" />}>
      <SideNav>
        <SideNav.Header title="門診管理" />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="預約總覽"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/appointment/appointments'
          )}
          onClick={() =>
            router.push(
              `/organizations/${router.query.organization_uuid}/appointment/appointments`
            )
          }
        />
        <SideNav.Header title="門診設定" />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="建立門診服務"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/appointment/service_products'
          )}
          onClick={() =>
            router.push(
              `/organizations/${router.query.organization_uuid}/appointment/service_products`
            )
          }
        />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="門診排班"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/appointment/schedules'
          )}
          onClick={() =>
            router.push(
              `/organizations/${router.query.organization_uuid}/appointment/schedules`
            )
          }
        />
      </SideNav>
    </WithSeparator>
  )
  return <OrganizationPageLayout leftNavigation={leftNavigation} {...props} />
}

export default OrganizationAppointmentPageLayout
