import SideNav from '@esen/essence/components/SideNav'
import Spacer from '@esen/essence/components/Spacer'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { useRouter } from 'next/router'
import { IDENTIFIER_KEY } from '../../constants/permission'
import OrganizationPageLayout from './OrganizationPageLayout'

const OrganizationAdminPageLayout = (props) => {
  const router = useRouter()
  const { identifierKeys } = useInternalUser()

  const leftNavigation = (
    <WithSeparator leading separator={<Spacer ySize="l" />}>
      <SideNav>
        <SideNav.Header title="診所設定" />
        {identifierKeys.includes(IDENTIFIER_KEY.ORGANIZATION_READER) && (
          <SideNav.Item
            icon={{ name: 'flight_takeoff' }}
            label="組織管理"
            active={router.pathname.startsWith(
              '/organizations/[organization_uuid]/admin/organization'
            )}
            onClick={() =>
              router.push(
                `/organizations/${router.query.organization_uuid}/admin/organization`
              )
            }
          />
        )}
        {identifierKeys.includes(IDENTIFIER_KEY.TEAM_READER) && (
          <SideNav.Item
            icon={{ name: 'flight_takeoff' }}
            label="團隊管理"
            active={router.pathname.startsWith(
              '/organizations/[organization_uuid]/admin/teams'
            )}
            onClick={() =>
              router.push(
                `/organizations/${router.query.organization_uuid}/admin/teams`
              )
            }
          />
        )}
        {identifierKeys.includes(IDENTIFIER_KEY.INTERNAL_USER_READER) && (
          <SideNav.Item
            icon={{ name: 'flight_takeoff' }}
            label="人員管理"
            active={router.pathname.startsWith(
              '/organizations/[organization_uuid]/admin/internal_users'
            )}
            onClick={() =>
              router.push(
                `/organizations/${router.query.organization_uuid}/admin/internal_users`
              )
            }
          />
        )}
        {identifierKeys.includes(IDENTIFIER_KEY.PERMISSION_READER) && (
          <SideNav.Item
            icon={{ name: 'flight_takeoff' }}
            label="權限管理"
            active={router.pathname.startsWith(
              '/organizations/[organization_uuid]/admin/permissions'
            )}
            onClick={() =>
              router.push(
                `/organizations/${router.query.organization_uuid}/admin/permissions`
              )
            }
          />
        )}
        <SideNav.Header title="全通路管理" />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="全通路銷售"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/admin/orders'
          )}
          onClick={() =>
            router.push(
              `/organizations/${router.query.organization_uuid}/admin/orders`
            )
          }
        />
        <SideNav.Item
          icon={{ name: 'flight_takeoff' }}
          label="商品上架管理"
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/admin/products'
          )}
          onClick={() =>
            router.push(
              `/organizations/${router.query.organization_uuid}/admin/products`
            )
          }
        />
      </SideNav>
    </WithSeparator>
  )
  return <OrganizationPageLayout leftNavigation={leftNavigation} {...props} />
}

export default OrganizationAdminPageLayout
