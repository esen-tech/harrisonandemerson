import Badge from '@esen/essence/components/Badge'
import Icon from '@esen/essence/components/Icon'
import Image from '@esen/essence/components/Image'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Tab from '@esen/essence/components/Tab'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { FilterTypes } from '@esen/utils/constants/organization_internal_user'
import { EMPLOYMENT_STATE } from '@esen/utils/constants/state'
import { get_full_name, get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrganizationAdminPageLayout from '../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../components/Page'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const AdminInternalUsersPage = () => {
  const [tab, setTab] = useState('在職中')
  const paginator = usePaginator()
  const [filterParams, setFilterParams] = useState()
  const [organization_internal_users, set_organization_internal_users] =
    useState([])
  const router = useRouter()
  const { organization_uuid } = router.query

  useEffect(() => {
    paginator.reset()
    set_organization_internal_users([])
    if (tab === '在職中') {
      setFilterParams({
        type: FilterTypes.EMPLOYMENT_STATE.type,
        query: EMPLOYMENT_STATE.EMPLOYED,
      })
    } else if (tab === '不在職') {
      setFilterParams({
        type: FilterTypes.EMPLOYMENT_STATE.type,
        query: EMPLOYMENT_STATE.NOT_EMPLOYED,
      })
    }
  }, [tab])

  useEffect(() => {
    async function fetchOrganizationInternalUsers() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization_uuid}/organization_internal_users`,
        {
          params: {
            filter: filterParams,
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_organization_internal_users(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid && filterParams) {
      fetchOrganizationInternalUsers()
    }
  }, [organization_uuid, filterParams, paginator.activePageToken])

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="人員管理"
          leftControl={
            <Tab type="pill">
              <Tab.Item
                active={tab === '在職中'}
                onClick={() => setTab('在職中')}
              >
                在職中
              </Tab.Item>
              <Tab.Item
                active={tab === '不在職'}
                onClick={() => setTab('不在職')}
              >
                不在職
              </Tab.Item>
            </Tab>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    人員名稱
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    職務
                  </Label>
                </Table.Th>
                {tab === '在職中' && (
                  <Table.Th>
                    <Label size="s" variant="tertiary">
                      所屬團隊
                    </Label>
                  </Table.Th>
                )}
                {tab === '不在職' && (
                  <Table.Th>
                    <Label size="s" variant="tertiary">
                      離職時間
                    </Label>
                  </Table.Th>
                )}
                <Table.Th rightIndent>
                  <Label size="s" variant="tertiary">
                    在職狀態
                  </Label>
                </Table.Th>
              </tr>
            </thead>
            <tbody>
              {organization_internal_users.map((oiu) => (
                <tr key={oiu.reference}>
                  <Table.Td leftIndent>
                    <Inline gap="s" alignItems="center">
                      <Image
                        rounded
                        height={24}
                        src={oiu.internal_user.avatar_src}
                      />
                      <Text size="s">{get_full_name(oiu.internal_user)}</Text>
                    </Inline>
                  </Table.Td>
                  <Table.Td>
                    <Text size="s">{oiu.position}</Text>
                  </Table.Td>
                  {tab === '在職中' && (
                    <Table.Td>
                      <Inline gap="xs">
                        {oiu.internal_user.team_internal_users
                          .filter(
                            (tiu) =>
                              tiu.team.organization.reference ==
                              organization_uuid
                          )
                          .map((tiu) => (
                            <Badge key={tiu.reference}>
                              {tiu.team.display_name}
                            </Badge>
                          ))}
                      </Inline>
                    </Table.Td>
                  )}
                  {tab === '不在職' && (
                    <Table.Td>
                      <Text size="s">
                        {get_local_datetime(oiu.last_resign_time, 'yyyy-MM-dd')}
                      </Text>
                    </Table.Td>
                  )}
                  <Table.Td rightIndent>
                    {oiu.employment_state === EMPLOYMENT_STATE.EMPLOYED && (
                      <Badge variant="positive">在職中</Badge>
                    )}
                    {oiu.employment_state === EMPLOYMENT_STATE.NOT_EMPLOYED && (
                      <Badge variant="negative">不在職</Badge>
                    )}
                  </Table.Td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <Table.Td crossRow />
              </tr>
            </tfoot>
          </Table>
        </Page.Section>

        <Page.Footer squished>
          <Inline justifyContent="space-between">
            <Inline gap="s" alignItems="center">
              <Label size="s">單頁顯示數量</Label>
              <Label size="s">{paginator.activePage?.count_per_page}</Label>
            </Inline>
            <Inline gap="xl">
              <Inline gap="s" alignItems="center">
                <Label size="s">總共</Label>
                <Label size="s">{paginator.activePage?.count_all_page}</Label>
              </Inline>
              <Inline gap="m" alignItems="center">
                <Icon
                  name="navigate_before"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goPrev}
                  disabled={paginator.isPrevDisabled()}
                />
                <Icon
                  name="navigate_next"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goNext}
                  disabled={paginator.isNextDisabled(
                    (defaultIsNextDisabled, previousPages) => {
                      const isLastPage =
                        previousPages.length *
                          (paginator.activePage?.count_per_page || 0) +
                          organization_internal_users.length ===
                        paginator.activePage?.count_all_page
                      return defaultIsNextDisabled || isLastPage
                    }
                  )}
                />
              </Inline>
            </Inline>
          </Inline>
        </Page.Footer>
      </Page>
    </OrganizationAdminPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminInternalUsersPage
