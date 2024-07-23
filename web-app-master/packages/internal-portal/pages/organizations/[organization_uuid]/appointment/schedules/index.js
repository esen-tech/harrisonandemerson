import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrganizationAppointmentPageLayout from '../../../../../components/layout/OrganizationAppointmentPageLayout'
import Page from '../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../utils/apiAgent'

const AppointmentSchedulesPage = () => {
  const paginator = usePaginator()
  const [schedules, set_schedules] = useState([])
  const router = useRouter()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchSchedules() {
      await harrisonApiAgent.get(
        `/scheduling/organizations/${organization_uuid}/schedules`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_schedules(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchSchedules()
    }
  }, [organization_uuid, paginator.activePageToken])

  return (
    <OrganizationAppointmentPageLayout>
      <Page>
        <Page.Header
          title="門診排班"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() =>
                router.push(
                  `/organizations/${organization_uuid}/appointment/schedules/create`
                )
              }
            >
              新增班表
            </Button>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    項目
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    班表區間
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    狀態
                  </Label>
                </Table.Th>
                <Table.Th rightIndent>
                  <Label size="s" variant="tertiary">
                    上次發佈時間
                  </Label>
                </Table.Th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <Link
                  key={schedule.reference}
                  href={`/organizations/${organization_uuid}/appointment/schedules/${schedule.reference}/edit`}
                >
                  <Table.Tr pointer>
                    <Table.Td leftIndent>
                      <Text size="s">{schedule.name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="s">
                        {`${schedule.min_date} —— ${schedule.max_date}`}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      {schedule.last_publish_time ? (
                        <Badge variant="positive">已發佈</Badge>
                      ) : (
                        <Badge variant="warning">未發佈</Badge>
                      )}
                    </Table.Td>
                    <Table.Td rightIndent>
                      {schedule.last_publish_time
                        ? get_local_datetime(
                            schedule.last_publish_time,
                            'yyyy-MM-dd HH:mm'
                          )
                        : '————————————'}
                    </Table.Td>
                  </Table.Tr>
                </Link>
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
                          schedules.length ===
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
    </OrganizationAppointmentPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AppointmentSchedulesPage
