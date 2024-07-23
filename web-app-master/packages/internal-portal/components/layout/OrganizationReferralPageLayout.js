import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import Link from 'next/link'
import { useRouter } from 'next/router'
import EsenNav from '../navigation/EsenNav'
import OrganizationPageLayout from './OrganizationPageLayout'

const OrganizationReferralPageLayout = ({ children, ...rest }) => {
  const router = useRouter()
  const { organization } = useCurrentOrganization()
  const sideNav = (
    <EsenNav className="flex-column">
      <EsenNav.Link disabled>轉診</EsenNav.Link>
      <Link
        passHref
        href={`/organizations/${organization?.uuid}/referrals/inbound`}
      >
        <EsenNav.Link
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/referrals/inbound'
          )}
        >
          轉入管理
        </EsenNav.Link>
      </Link>
      <Link
        passHref
        href={`/organizations/${organization?.uuid}/referrals/outbound`}
      >
        <EsenNav.Link
          active={router.pathname.startsWith(
            '/organizations/[organization_uuid]/referrals/outbound'
          )}
        >
          轉出管理
        </EsenNav.Link>
      </Link>
    </EsenNav>
  )
  return (
    <OrganizationPageLayout sideNav={sideNav} {...rest}>
      {children}
    </OrganizationPageLayout>
  )
}

export default OrganizationReferralPageLayout
