import SideNav from '@esen/essence/components/SideNav'
import Spacer from '@esen/essence/components/Spacer'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { useRouter } from 'next/router'
import { IDENTIFIER_KEY } from '../../constants/permission'
import OrganizationPageLayout from './OrganizationPageLayout'

const OrganizationMarketingPageLayout = (props) => {
  const router = useRouter()
  const { identifierKeys } = useInternalUser()

  const leftNavigation = (
    <WithSeparator leading separator={<Spacer ySize="l" />}>
      <SideNav>
        <SideNav.Header title="行銷管理" />
        {identifierKeys.includes(IDENTIFIER_KEY.MARKETING_READER) && (
          <>
            <SideNav.Item
              icon={{ name: 'flight_takeoff' }}
              label="合作代碼管理"
              active={router.pathname.startsWith(
                '/organizations/[organization_uuid]/marketing/cooperation_code'
              )}
              onClick={() =>
                router.push(
                  `/organizations/${router.query.organization_uuid}/marketing/cooperation_code`
                )
              }
            />
            <SideNav.Item
              icon={{ name: 'flight_takeoff' }}
              label="優惠代碼管理"
              active={router.pathname.startsWith(
                '/organizations/[organization_uuid]/marketing/promo_code'
              )}
              onClick={() =>
                router.push(
                  `/organizations/${router.query.organization_uuid}/marketing/promo_code`
                )
              }
            />
          </>
        )}
      </SideNav>
    </WithSeparator>
  )
  return <OrganizationPageLayout leftNavigation={leftNavigation} {...props} />
}

export default OrganizationMarketingPageLayout
