import Container from '@esen/essence/components/Container'
import Dropdown from '@esen/essence/components/Dropdown'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Spacer from '@esen/essence/components/Spacer'
import Text from '@esen/essence/components/Text'
import { get_full_name, get_organization_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import Logo from '../../components/brand/Logo'
import { IDENTIFIER_KEY } from '../../constants/permission'
import { harrisonApiAgent } from '../../utils/apiAgent'

const StyledNav = styled(Inline)`
  border-bottom: 1px solid var(--es-theme-border-inversed-primary-disabled);
`

const StyledNavBrand = styled(Container)`
  width: 240px;
  padding: 12px;
  border-right: 1px solid var(--es-theme-border-inversed-primary-disabled);
  border-bottom: 2px solid transparent;
`

const StyledNavLink = styled.div`
  padding: 0 16px;
  cursor: pointer;
`

const StyledNavLinkContent = styled.div`
  padding: 16px 0;

  ${({ $active }) => {
    if ($active) {
      return `
        border-bottom: 2px solid var(--es-theme-fg-primary-default);
      `
    }
  }}
`

const StyledNavDropdownToggle = styled(Dropdown.Toggle)`
  padding: 16px;
  cursor: pointer;
`

const StyledNavDropdownMenu = styled(Dropdown.Menu)`
  filter: drop-shadow(4px 4px 20px rgba(0, 0, 0, 0.1));
  background-color: white;
  margin-top: var(--es-theme-space-margin-xs);
  right: 0;
  min-width: 160px;
  z-index: 1;
`

const StyledNavDropdownMenuItem = styled.div`
  cursor: pointer;
  width: 100%;
  padding: var(--es-theme-space-padding-squished-m);
  color: var(--es-theme-fg-primary-default);

  &:hover:not(:disabled) {
    color: var(--es-theme-fg-primary-hovered);
    background-color: var(--es-theme-bg-primary-hovered);
  }

  &:active:not(:disabled) {
    color: var(--es-theme-fg-primary-selected);
    background-color: var(--es-theme-bg-primary-selected);
  }
`

const TopNavigation = () => {
  const router = useRouter()
  // const { t } = useTranslation('common')
  const { internalUser, identifierKeys, setInternalUser } = useInternalUser()
  const { organization } = useCurrentOrganization()

  return (
    <StyledNav fluid>
      <Dropdown>
        <Dropdown.Toggle as={StyledNavBrand}>
          <Inline alignItems="center">
            <Logo style={{ width: 32, height: 32 }} />
            <Text>{get_organization_name(organization)}</Text>
          </Inline>
        </Dropdown.Toggle>
        {/* <Dropdown.Menu>Switch workspace</Dropdown.Menu> */}
      </Dropdown>

      <Spacer xSize="l" />

      <Inline grow={1} justifyContent="space-between">
        <Inline>
          {/* <Link passHref href={`/organizations/${organization?.reference}`}>
            <StyledNavLink>
              <StyledNavLinkContent
                $active={
                  router.pathname === '/organizations/[organization_uuid]'
                }
              >
                <Text variant="secondary" wrap={false}>
                  {t('page.organizations.dashboard')}
                </Text>
              </StyledNavLinkContent>
            </StyledNavLink>
          </Link> */}

          <Link
            passHref
            href={`/organizations/${organization?.reference}/admin/organization`}
          >
            <StyledNavLink>
              <StyledNavLinkContent
                $active={router.pathname.startsWith(
                  '/organizations/[organization_uuid]/admin'
                )}
              >
                <Text variant="secondary" wrap={false}>
                  營運管理
                </Text>
              </StyledNavLinkContent>
            </StyledNavLink>
          </Link>

          <Link
            passHref
            href={`/organizations/${organization?.reference}/appointment/appointments`}
          >
            <StyledNavLink>
              <StyledNavLinkContent
                $active={router.pathname.startsWith(
                  '/organizations/[organization_uuid]/appointment'
                )}
              >
                <Text variant="secondary" wrap={false}>
                  門診排程
                </Text>
              </StyledNavLinkContent>
            </StyledNavLink>
          </Link>

          {identifierKeys.includes(IDENTIFIER_KEY.EMR_READER) && (
            <Link
              passHref
              href={`/organizations/${organization?.reference}/profiles`}
            >
              <StyledNavLink>
                <StyledNavLinkContent
                  $active={router.pathname.startsWith(
                    '/organizations/[organization_uuid]/profiles'
                  )}
                >
                  <Text variant="secondary" wrap={false}>
                    病歷系統
                  </Text>
                </StyledNavLinkContent>
              </StyledNavLink>
            </Link>
          )}

          {identifierKeys.includes(IDENTIFIER_KEY.MARKETING_READER) && (
            <Link
              passHref
              href={`/organizations/${organization?.reference}/marketing/cooperation_code`}
            >
              <StyledNavLink>
                <StyledNavLinkContent
                  $active={router.pathname.startsWith(
                    '/organizations/[organization_uuid]/marketing/cooperation_code'
                  )}
                >
                  <Text variant="secondary" wrap={false}>
                    行銷管理
                  </Text>
                </StyledNavLinkContent>
              </StyledNavLink>
            </Link>
          )}
        </Inline>

        <Dropdown align="right">
          <StyledNavDropdownToggle>
            <Inline gap="s">
              <Text variant="secondary">
                <Icon name="account_circle" sizeInPixel={24} />
              </Text>
              <Text variant="secondary" wrap={false}>
                {internalUser ? get_full_name(internalUser) : '工作人員'}
              </Text>
              <Text variant="secondary">
                <Icon name="expand_more" />
              </Text>
            </Inline>
          </StyledNavDropdownToggle>
          <StyledNavDropdownMenu>
            <StyledNavDropdownMenuItem
              onClick={async () => {
                await harrisonApiAgent.post(
                  '/iam/internal_users/logout',
                  null,
                  {
                    onFail: (_status, data) => {
                      alert(data.message)
                    },
                    onSuccess: async (_data) => {
                      setInternalUser(null)
                      router.replace('/')
                    },
                  }
                )
              }}
            >
              登出
            </StyledNavDropdownMenuItem>
          </StyledNavDropdownMenu>
        </Dropdown>
      </Inline>
    </StyledNav>
  )
}

export default TopNavigation
