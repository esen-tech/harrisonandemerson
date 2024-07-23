import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Checkbox from '@esen/essence/components/Checkbox'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { get_local_datetime, get_organization_name } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useCareProductCollection } from '@esen/utils/hooks/useCareProductCollection'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useDeliveryOrderCollection } from '@esen/utils/hooks/useDeliveryOrderCollection'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import OrganizationAdminPageLayout from '../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../components/Page'
import SidePanel from '../../../../components/SidePanel'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const AdminOrdersPage = () => {
  const { organization } = useCurrentOrganization()
  const paginator = usePaginator()
  const [financial_orders, set_financial_orders] = useState([])
  const [active_financial_order, set_active_financial_order] = useState()
  const [activeFinancialOrderReference, setActivePromoCodeReference] =
    useState()
  const [showCreateOrderModal, setShowCreateOrderModal] = useState(false)
  const careProductCollection = useCareProductCollection()
  const deliveryOrderCollection = useDeliveryOrderCollection()
  const router = useRouter()
  const createOrderForm = useForm({
    defaultValues: { 'delivery_orders.0.isSameAsRecipientEndUser': true },
  })
  const { organization_uuid } = router.query
  const watchIsSameAsRecipientEndUser = createOrderForm.watch(
    `delivery_orders.0.isSameAsRecipientEndUser`
  )

  async function fetchFinancialOrder(financialOrderReference) {
    await harrisonApiAgent.get(
      `/product/financial_orders/${financialOrderReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_active_financial_order(data)
        },
      }
    )
  }

  useEffect(() => {
    async function fetchFinancialOrders() {
      await harrisonApiAgent.get(
        `/product/organizations/${organization_uuid}/financial_orders`,
        {
          params: {
            is_created_by_organization: true,
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_financial_orders(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchFinancialOrders()
    }
  }, [organization_uuid, paginator.activePageToken])

  useEffect(() => {
    financial_orders.forEach((financial_order) => {
      careProductCollection.addReference(financial_order.care_product_reference)
      deliveryOrderCollection.addFinancialOrderReference(
        financial_order.reference
      )
    })
  }, [financial_orders])

  useEffect(() => {
    if (activeFinancialOrderReference) {
      fetchFinancialOrder(activeFinancialOrderReference)
    }
  }, [activeFinancialOrderReference])

  const handleHideCreateOrderModal = () => {
    setShowCreateOrderModal(false)
    createOrderForm.reset({
      program_name: null,
      code: null,
      effective_time: null,
      expiration_time: null,
    })
  }

  const handleSubmitCreateOrderForm = async (payload) => {
    await harrisonApiAgent.post(
      `/product/organizations/${organization_uuid}/orders`,
      {
        ...payload,
        delivery_orders: payload.delivery_orders.map((deliver_order) => {
          return {
            ...deliver_order,
            raw_served_end_user_full_name:
              deliver_order.isSameAsRecipientEndUser
                ? deliver_order.raw_recipient_end_user_full_name
                : deliver_order.raw_served_end_user_full_name,
            raw_served_end_user_phone_number:
              deliver_order.isSameAsRecipientEndUser
                ? deliver_order.raw_recipient_end_user_phone_number
                : deliver_order.raw_served_end_user_phone_number,
          }
        }),
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="全通路銷售"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() => setShowCreateOrderModal(true)}
            >
              新增銷售物流
            </Button>
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    金流單號
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    收件人
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    購買商品
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    下單日期
                  </Label>
                </Table.Th>
                <Table.Th rightIndent>
                  <Label size="s" variant="tertiary">
                    通路單位
                  </Label>
                </Table.Th>
              </tr>
            </thead>
            <tbody>
              {financial_orders.map((financial_order) => (
                <Table.Tr
                  key={financial_order.reference}
                  pointer
                  onClick={() =>
                    setActivePromoCodeReference(financial_order.reference)
                  }
                >
                  <Table.Td leftIndent>
                    <Text size="s">
                      {financial_order.ecpay_merchant_trade_no}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="s">
                      {deliveryOrderCollection.financialOrderMap?.[
                        financial_order.reference
                      ]?.raw_recipient_end_user_full_name || 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="s">
                      {careProductCollection.map?.[
                        financial_order.care_product_reference
                      ]?.display_sku_key || 'N/A'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="s">
                      {get_local_datetime(
                        financial_order.create_time,
                        'yyyy-MM-dd'
                      )}
                    </Text>
                  </Table.Td>
                  <Table.Td rightIndent>
                    <Badge>{get_organization_name(organization)}</Badge>
                  </Table.Td>
                </Table.Tr>
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
                          financial_orders.length ===
                        paginator.activePage?.count_all_page
                      return defaultIsNextDisabled || isLastPage
                    }
                  )}
                />
              </Inline>
            </Inline>
          </Inline>
        </Page.Footer>

        {activeFinancialOrderReference && (
          <Page.SidePanel
            title="訂單細節"
            onClose={() => setActivePromoCodeReference()}
          >
            <SidePanel.Section title="金流單號">
              <Container>
                <Text>
                  {active_financial_order?.ecpay_merchant_trade_no || 'N/A'}
                </Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="收件人">
              <Container>
                <Text>
                  {deliveryOrderCollection.financialOrderMap?.[
                    active_financial_order?.reference
                  ]?.raw_recipient_end_user_full_name || 'N/A'}
                </Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="購買商品">
              <Container>
                <Text>
                  {careProductCollection.map?.[
                    active_financial_order?.care_product_reference
                  ]?.display_sku_key || 'N/A'}
                </Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="下單日期">
              <Container>
                <Text>
                  {active_financial_order &&
                    get_local_datetime(
                      active_financial_order.create_time,
                      'yyyy-MM-dd HH:mm:ss'
                    )}
                </Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="通路單位">
              <Container>
                <Badge>{get_organization_name(organization)}</Badge>
              </Container>
            </SidePanel.Section>
          </Page.SidePanel>
        )}
      </Page>

      <Modal
        show={showCreateOrderModal}
        onHide={handleHideCreateOrderModal}
        style={{
          minWidth: 846,
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
              <Label size="l">新增銷售物流</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideCreateOrderModal}
              />
            </Inline>

            <Inline fluid gap="xl">
              <Stack fluid gap="xl">
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    通路單位
                  </Label>
                  <Input
                    fluid
                    disabled
                    value={get_organization_name(organization)}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    購買商品
                  </Label>
                  <Controller
                    control={createOrderForm.control}
                    name="financial_order.care_product_reference"
                    render={({ field }) => (
                      <DropdownSelect
                        fluid
                        getOptions={async (sendOptions) => {
                          await harrisonApiAgent.get(
                            '/product/care_products/unexpired',
                            {
                              onFail: (_status, data) => {
                                alert(data.message)
                              },
                              onSuccess: (data) => {
                                sendOptions(
                                  data
                                    .filter(
                                      (care_product) =>
                                        care_product.delivery_order_count === 1
                                    )
                                    .map((care_product) => ({
                                      label: care_product.display_sku_key,
                                      value: care_product.reference,
                                    }))
                                )
                              },
                            }
                          )
                        }}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Checkbox
                    id="is_in_store_pickup"
                    {...createOrderForm.register(
                      `delivery_orders.0.is_in_store_pickup`
                    )}
                  >
                    <Label htmlFor="is_in_store_pickup" pointer>
                      是否已現場取貨
                    </Label>
                  </Checkbox>
                </Field>
              </Stack>

              <Stack fluid gap="xl">
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    收件人姓名
                  </Label>
                  <Input
                    fluid
                    placeholder="填入收件人姓名"
                    {...createOrderForm.register(
                      'delivery_orders.0.raw_recipient_end_user_full_name'
                    )}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    收件人電話
                  </Label>
                  <Input
                    fluid
                    placeholder="填入收件人電話"
                    {...createOrderForm.register(
                      'delivery_orders.0.raw_recipient_end_user_phone_number'
                    )}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    收件人地址
                  </Label>
                  <Input
                    fluid
                    placeholder="填入收件人地址"
                    {...createOrderForm.register(
                      'delivery_orders.0.delivery_address'
                    )}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Checkbox
                    id="isSameAsRecipientEndUser"
                    {...createOrderForm.register(
                      `delivery_orders.0.isSameAsRecipientEndUser`,
                      {
                        onChange: (e) => {
                          if (!e.target.checked) {
                            createOrderForm.setValue(
                              `delivery_orders.0.raw_served_end_user_full_name`,
                              createOrderForm.getValues(
                                `delivery_orders.0.raw_recipient_end_user_full_name`
                              )
                            )
                            createOrderForm.setValue(
                              `delivery_orders.0.raw_served_end_user_phone_number`,
                              createOrderForm.getValues(
                                `delivery_orders.0.raw_recipient_end_user_phone_number`
                              )
                            )
                          }
                        },
                      }
                    )}
                  >
                    <Label htmlFor="isSameAsRecipientEndUser" pointer>
                      採檢人同收貨人
                    </Label>
                  </Checkbox>
                </Field>
                {!watchIsSameAsRecipientEndUser && (
                  <>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        採檢人姓名
                      </Label>
                      <Input
                        fluid
                        placeholder="填入採檢人姓名"
                        {...createOrderForm.register(
                          'delivery_orders.0.raw_served_end_user_full_name'
                        )}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        採檢人電話
                      </Label>
                      <Input
                        fluid
                        placeholder="填入採檢人電話"
                        {...createOrderForm.register(
                          'delivery_orders.0.raw_served_end_user_phone_number'
                        )}
                      />
                    </Field>
                  </>
                )}
              </Stack>
            </Inline>

            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideCreateOrderModal}>取消</Button>
              <Button
                inversed
                variant="primary"
                onClick={createOrderForm.handleSubmit(
                  handleSubmitCreateOrderForm
                )}
                loading={createOrderForm.formState.isSubmitting}
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

export default AdminOrdersPage
