import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Field from '@esen/essence/components/Field'
import Icon from '@esen/essence/components/Icon'
import Image from '@esen/essence/components/Image'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { getCommaSeparatedNumber, get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import OrganizationAdminPageLayout from '../../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../utils/apiAgent'

const AdminProductsPage = () => {
  const paginator = usePaginator()
  const [care_products, set_care_products] = useState([])
  const [
    showSelectDeliveryOrderCountModal,
    setShowSelectDeliveryOrderCountModal,
  ] = useState(false)
  const selectDeliveryOrderCountForm = useForm({
    defaultValues: { deliveryOrderType: 'personal' },
  })
  const router = useRouter()
  const { organization_uuid } = router.query
  const watchDeliveryOrderType =
    selectDeliveryOrderCountForm.watch('deliveryOrderType')
  const watchDeliveryOrderCount =
    selectDeliveryOrderCountForm.watch('deliveryOrderCount')

  useEffect(() => {
    async function fetchCareProducts() {
      await harrisonApiAgent.get(
        `/product/organizations/${organization_uuid}/care_products`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_care_products(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchCareProducts()
    }
  }, [organization_uuid, paginator.activePageToken])

  const handleHideSelectDeliveryOrderCountModal = () => {
    setShowSelectDeliveryOrderCountModal(false)
  }

  const handleSubmitSelectDeliveryOrderCountForm = async (payload) => {
    router.push({
      pathname: `/organizations/${organization_uuid}/admin/products/create`,
      query: {
        deliveryOrderCount:
          payload.deliveryOrderType === 'personal'
            ? 1
            : payload.deliveryOrderCount,
      },
    })
  }

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="商品上架管理"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() => setShowSelectDeliveryOrderCountModal(true)}
            >
              新增商品
            </Button>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    商品縮圖
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    商品名稱
                  </Label>
                </Table.Th>
                <Table.Th justifyContent="end">
                  <Label size="s" variant="tertiary">
                    售價
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    方案類型
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
              {care_products.map((care_product) => {
                const local_now = new Date()
                const local_effective_time = new Date(
                  get_local_datetime(
                    care_product.effective_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const local_expiration_time = new Date(
                  get_local_datetime(
                    care_product.expire_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const isNotStarted = local_now < local_effective_time
                const isExpired = local_expiration_time <= local_now
                return (
                  <Link
                    key={care_product.reference}
                    href={`/organizations/${organization_uuid}/admin/products/${care_product.reference}/edit`}
                  >
                    <Table.Tr pointer>
                      <Table.Td leftIndent>
                        <Image
                          height={40}
                          src={
                            care_product.care_product_images.sort(
                              (a, b) => a.sequence - b.sequence
                            )[0].src
                          }
                        />
                      </Table.Td>
                      <Table.Td>
                        <Text size="s">
                          {care_product.display_sku_key || 'N/A'}
                        </Text>
                      </Table.Td>
                      <Table.Td justifyContent="end">
                        <Text size="s">
                          $
                          {getCommaSeparatedNumber(
                            care_product.sale_price_amount
                          )}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge>
                          {care_product.delivery_order_count === 1
                            ? '個人方案'
                            : '團體方案'}
                        </Badge>
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
                          care_products.length ===
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

      <Modal
        show={showSelectDeliveryOrderCountModal}
        onHide={handleHideSelectDeliveryOrderCountModal}
        style={{
          minWidth: 400,
          borderRadius: 'var(--es-border-radius-1)',
        }}
      >
        <Container
          fluid
          size="l"
          style={{
            borderRadius: 'var(--es-border-radius-1)',
          }}
        >
          <Stack fluid gap="xl">
            <Inline fluid justifyContent="space-between">
              <Label size="l">新增商品</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideSelectDeliveryOrderCountModal}
              />
            </Inline>
            <Stack fluid gap="xl">
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  商品種類
                </Label>
                <Inline fluid gap="m">
                  <Field fluid>
                    <Input
                      {...selectDeliveryOrderCountForm.register(
                        'deliveryOrderType'
                      )}
                      type="radio"
                      id="personal"
                      value="personal"
                    />
                    <label htmlFor="personal">個人商品</label>
                  </Field>
                  <Field fluid>
                    <Input
                      {...selectDeliveryOrderCountForm.register(
                        'deliveryOrderType'
                      )}
                      type="radio"
                      id="group"
                      value="group"
                    />
                    <label htmlFor="group">團體商品</label>
                  </Field>
                </Inline>
              </Field>
              {watchDeliveryOrderType === 'group' && (
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    團體人數
                  </Label>
                  <Input
                    fluid
                    placeholder="填入人數須大於1人"
                    {...selectDeliveryOrderCountForm.register(
                      'deliveryOrderCount'
                    )}
                  />
                </Field>
              )}
            </Stack>
            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideSelectDeliveryOrderCountModal}>
                取消
              </Button>
              <Button
                inversed
                variant="primary"
                onClick={selectDeliveryOrderCountForm.handleSubmit(
                  handleSubmitSelectDeliveryOrderCountForm
                )}
                disabled={
                  watchDeliveryOrderType === 'group' &&
                  (isNaN(parseInt(watchDeliveryOrderCount)) ||
                    parseInt(watchDeliveryOrderCount) <= 1)
                }
                loading={selectDeliveryOrderCountForm.formState.isSubmitting}
              >
                確定
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Modal>
    </OrganizationAdminPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminProductsPage
