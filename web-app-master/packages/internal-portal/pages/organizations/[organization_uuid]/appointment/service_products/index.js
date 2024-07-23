import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { getCommaSeparatedNumber, get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import OrganizationAppointmentPageLayout from '../../../../../components/layout/OrganizationAppointmentPageLayout'
import Page from '../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../utils/apiAgent'

const AppointmentServiceProductsPage = () => {
  const paginator = usePaginator()
  const [service_products, set_service_products] = useState([])
  const router = useRouter()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchServiceProducts() {
      await harrisonApiAgent.get(
        `/product/organizations/${organization_uuid}/service_products`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_service_products(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchServiceProducts()
    }
  }, [organization_uuid, paginator.activePageToken])

  return (
    <OrganizationAppointmentPageLayout>
      <Page>
        <Page.Header
          title="建立門診服務"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() =>
                router.push(
                  `/organizations/${organization_uuid}/appointment/service_products/create`
                )
              }
            >
              新增服務
            </Button>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    服務名稱
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    健保/自費
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    門診長度
                  </Label>
                </Table.Th>
                <Table.Th justifyContent="end">
                  <Label size="s" variant="tertiary">
                    掛號費
                  </Label>
                </Table.Th>
                <Table.Th rightIndent>
                  <Label size="s" variant="tertiary">
                    狀態
                  </Label>
                </Table.Th>
              </tr>
            </thead>
            <tbody>
              {service_products.map((service_product) => {
                const local_now = new Date()
                const local_effective_time = new Date(
                  get_local_datetime(
                    service_product.effective_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const local_expiration_time = new Date(
                  get_local_datetime(
                    service_product.expire_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const isNotStarted = local_now < local_effective_time
                const isExpired = local_expiration_time <= local_now
                return (
                  <Link
                    key={service_product.reference}
                    href={`/organizations/${organization_uuid}/appointment/service_products/${service_product.reference}/edit`}
                  >
                    <Table.Tr pointer>
                      <Table.Td leftIndent>
                        <Text size="s">{service_product.display_sku_key}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge>
                          {service_product.service_product_insurers.length > 0
                            ? '健保'
                            : '自費'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="s">
                          {service_product.duration_in_time_slots * 5} 分鐘
                        </Text>
                      </Table.Td>
                      <Table.Td justifyContent="end">
                        <Text size="s">
                          $
                          {getCommaSeparatedNumber(
                            service_product.registration_fee_amount
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td rightIndent>
                        {isNotStarted && <Badge variant="info">準備上架</Badge>}
                        {isExpired && <Badge variant="negative">已下架</Badge>}
                        {!isNotStarted && !isExpired && (
                          <Badge variant="positive">已上架</Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  </Link>
                )
              })}
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
                          service_products.length ===
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

export default AppointmentServiceProductsPage
