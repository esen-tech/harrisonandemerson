import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import ImageCarousel from '@esen/essence/components/ImageCarousel'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import Textarea from '@esen/essence/components/Textarea'
import {
  getCommaSeparatedNumber,
  get_local_datetime,
  local_to_utc,
} from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import OrganizationAdminPageLayout from '../../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../utils/apiAgent'

const AdminCreateProductPage = () => {
  const router = useRouter()
  const { organization_uuid, deliveryOrderCount } = router.query
  const createCareProductForm = useForm({
    defaultValues: {
      delivery_order_count: parseInt(deliveryOrderCount) || 1,
      care_product_images: [{ src: '' }],
    },
  })
  const createCareProductFormCareProductImageFieldArray = useFieldArray({
    control: createCareProductForm.control,
    name: 'care_product_images',
  })
  const createCareProductFormCareProductPromoCodeFieldArray = useFieldArray({
    control: createCareProductForm.control,
    name: 'care_product_promo_codes',
  })
  const appendCareProductPromoCodeForm = useForm()
  const [
    showAppendCareProductPromoCodeModal,
    setShowAppendCareProductPromoCodeModal,
  ] = useState(false)
  const [
    selectedCareProductPromoCodeIndex,
    setSelectedCareProductPromoCodeIndex,
  ] = useState()
  const [
    showDeleteCareProductPromoCodeModal,
    setShowDeleteCareProductPromoCodeModal,
  ] = useState(false)
  const [promo_codes, set_promo_codes] = useState([])
  const watchDeliveryOrderCount = createCareProductForm.watch(
    'delivery_order_count'
  )
  const watchSelectedCareProductPromoCode = createCareProductForm.watch(
    `care_product_promo_codes.${selectedCareProductPromoCodeIndex}`
  )
  const watchCareProductImages = createCareProductForm.watch(
    'care_product_images'
  )
  const promoCodeMap = promo_codes.reduce(
    (m, pc) => ({ ...m, [pc.reference]: pc }),
    {}
  )
  const appendedCareProductPromoCodeReferences = createCareProductForm
    .getValues()
    ?.['care_product_promo_codes']?.map((cppc) => cppc.promo_code_reference)
  const selectedPromoCode =
    promoCodeMap[watchSelectedCareProductPromoCode?.promo_code_reference]

  const handleHideAppendCareProductPromoCodeModal = () => {
    setShowAppendCareProductPromoCodeModal(false)
  }

  const handleHideDeleteCareProductPromoCodeModal = () => {
    setSelectedCareProductPromoCodeIndex(null)
    setShowDeleteCareProductPromoCodeModal(false)
  }

  const handleSubmitAppendCareProductPromoCodeForm = async (payload) => {
    createCareProductFormCareProductPromoCodeFieldArray.append(payload)
    handleHideAppendCareProductPromoCodeModal()
  }

  useEffect(() => {
    async function fetchPromoCodes() {
      await harrisonApiAgent.get(
        `/marketing/organizations/${organization_uuid}/promo_codes`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_promo_codes(enhanced_data)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchPromoCodes()
    }
  }, [organization_uuid])

  const handleSubmitCreateCareProductForm = async (payload) => {
    await harrisonApiAgent.post(
      `/product/organizations/${organization_uuid}/care_products`,
      {
        ...payload,
        effective_time: local_to_utc(payload.effective_time),
        expire_time: local_to_utc(payload.expire_time),
        care_product_images: payload.care_product_images.map((cpi, i) => ({
          ...cpi,
          sequence: i,
        })),
      },
      {
        onFail: (_status, data) => {
          alert(data?.message)
        },
        onSuccess: (data) => {
          router.push(`/organizations/${organization_uuid}/admin/products`)
        },
      }
    )
  }

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="新增商品"
          rightControl={
            <Inline gap="s">
              <Button
                onClick={() =>
                  router.push(
                    `/organizations/${organization_uuid}/admin/products`
                  )
                }
              >
                取消建立
              </Button>
              <Button
                variant="primary"
                inversed
                prefix={<Icon inversed name="add" />}
                onClick={createCareProductForm.handleSubmit(
                  handleSubmitCreateCareProductForm
                )}
              >
                商品上架
              </Button>
            </Inline>
          }
        />
        <Container fluid size="l" style={{ background: 'transparent' }}>
          <Grid fluid columns={12} columnGap="l">
            <Grid.Area columnSpan={7}>
              <Page.Section inset>
                <Stack gap="xxl">
                  <Stack>
                    <Heading size="m">商品資訊</Heading>
                    <Text size="s" variant="tertiary">
                      關於商品的所有資訊
                    </Text>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">商品名稱</Heading>
                    <Input
                      fluid
                      placeholder="填入商品名稱"
                      {...createCareProductForm.register('display_sku_key')}
                    />
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">產品敘述說明</Heading>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        產品介紹
                      </Label>
                      <Textarea
                        fluid
                        placeholder="填入你的產品介紹"
                        {...createCareProductForm.register(
                          'display_description_key'
                        )}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        內容物規格說明
                      </Label>
                      <Textarea
                        fluid
                        placeholder="填入你的內容物規格說明"
                        {...createCareProductForm.register(
                          'display_specification_key'
                        )}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        物流資訊
                      </Label>
                      <Textarea
                        fluid
                        placeholder="填入你的物流資訊"
                        {...createCareProductForm.register(
                          'display_delivery_description_key'
                        )}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        注意事項
                      </Label>
                      <Textarea
                        fluid
                        placeholder="填入你的注意事項"
                        {...createCareProductForm.register('display_note')}
                      />
                    </Field>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">產品圖片</Heading>
                    <ImageCarousel
                      srcs={watchCareProductImages?.map((cpi) => cpi.src)}
                    />
                    {createCareProductFormCareProductImageFieldArray.fields.map(
                      (field, idx) => (
                        <Field key={field.id} as={Stack} fluid>
                          <Label size="s" variant="secondary">
                            圖片 - {idx + 1}
                          </Label>
                          <Inline fluid gap="l">
                            <Input
                              fluid
                              placeholder="https://image.somewhere.com"
                              {...createCareProductForm.register(
                                `care_product_images.${idx}.src`
                              )}
                            />
                            {idx > 0 && (
                              <Button
                                variant="negative"
                                onClick={() =>
                                  createCareProductFormCareProductImageFieldArray.remove(
                                    idx
                                  )
                                }
                              >
                                <Icon
                                  name="delete_outline"
                                  variant="negative"
                                />
                              </Button>
                            )}
                          </Inline>
                        </Field>
                      )
                    )}
                    <Button
                      prefix={<Icon name="add" />}
                      onClick={() =>
                        createCareProductFormCareProductImageFieldArray.append({
                          src: '',
                        })
                      }
                    >
                      新增圖片
                    </Button>
                  </Stack>
                </Stack>
              </Page.Section>
            </Grid.Area>
            <Grid.Area columnSpan={5}>
              <Page.Section inset>
                <Stack gap="xxl">
                  <Stack>
                    <Heading size="m">商品設定</Heading>
                    <Text size="s" variant="tertiary">
                      關於商品的所有數值設定
                    </Text>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">產品價格</Heading>
                    <Inline gap="l">
                      <Field as={Stack} fluid>
                        <Label size="s" variant="secondary">
                          原價
                        </Label>
                        <Input
                          fluid
                          type="number"
                          {...createCareProductForm.register(
                            'original_price_amount'
                          )}
                        />
                      </Field>
                      <Field as={Stack} fluid>
                        <Label size="s" variant="secondary">
                          售價
                        </Label>
                        <Input
                          fluid
                          type="number"
                          {...createCareProductForm.register(
                            'sale_price_amount'
                          )}
                        />
                      </Field>
                    </Inline>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">產品上架期間</Heading>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        生效日期
                      </Label>
                      <Input
                        fluid
                        type="datetime-local"
                        {...createCareProductForm.register('effective_time')}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        過期日期
                      </Label>
                      <Input
                        fluid
                        type="datetime-local"
                        {...createCareProductForm.register('expire_time')}
                      />
                    </Field>
                  </Stack>
                  {watchDeliveryOrderCount === 1 && (
                    <Stack gap="l" fluid>
                      <Heading size="s">適用優惠方案</Heading>
                      {createCareProductFormCareProductPromoCodeFieldArray.fields.map(
                        (field, idx) => {
                          const values = createCareProductForm.getValues()
                          const care_product_promo_code =
                            values.care_product_promo_codes[idx]
                          const promo_code =
                            promoCodeMap[
                              care_product_promo_code.promo_code_reference
                            ]
                          const local_now = new Date()
                          const local_effective_time = new Date(
                            get_local_datetime(
                              promo_code?.effective_time,
                              'yyyy-MM-dd HH:mm:ss'
                            )
                          )
                          const local_expiration_time = new Date(
                            get_local_datetime(
                              promo_code?.expiration_time,
                              'yyyy-MM-dd HH:mm:ss'
                            )
                          )
                          const isNotStarted = local_now < local_effective_time
                          const isExpired = local_expiration_time <= local_now
                          let badge = {
                            variant: isNotStarted
                              ? 'secondary'
                              : isExpired
                              ? 'secondary'
                              : 'positive',
                            children: isNotStarted
                              ? '未開始'
                              : isExpired
                              ? '已過期'
                              : '進行中',
                          }

                          return (
                            <ListItem
                              key={field.id}
                              verticallyCentered
                              controlScope="all"
                              onClick={() => {
                                setSelectedCareProductPromoCodeIndex(idx)
                                setShowDeleteCareProductPromoCodeModal(true)
                              }}
                            >
                              <ListItem.Content
                                title={promo_code?.program_name}
                                paragraph={promo_code?.code}
                              />
                              <ListItem.Control
                                badge={badge}
                                icon={{ name: 'arrow_forward_ios' }}
                              />
                            </ListItem>
                          )
                        }
                      )}
                      <Button
                        prefix={<Icon name="add" />}
                        onClick={() => {
                          appendCareProductPromoCodeForm.reset({
                            promo_code_reference: null,
                            discount_price_amount: null,
                          })
                          setShowAppendCareProductPromoCodeModal(true)
                        }}
                      >
                        新增適用優惠方案
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Page.Section>
            </Grid.Area>
          </Grid>
        </Container>
      </Page>

      <Modal
        show={showAppendCareProductPromoCodeModal}
        onHide={handleHideAppendCareProductPromoCodeModal}
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
              <Label size="l">新增適用優惠方案</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideAppendCareProductPromoCodeModal}
              />
            </Inline>
            <Stack fluid gap="xl">
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  適用優惠方案
                </Label>
                <Controller
                  control={appendCareProductPromoCodeForm.control}
                  name="promo_code_reference"
                  render={({ field }) => (
                    <DropdownSelect
                      fluid
                      options={promo_codes
                        .filter(
                          (promo_code) =>
                            !appendedCareProductPromoCodeReferences.includes(
                              promo_code.reference
                            )
                        )
                        .map((promo_code) => ({
                          label: promo_code.program_name,
                          value: promo_code.reference,
                        }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  優惠折價
                </Label>
                <Input
                  fluid
                  type="number"
                  {...appendCareProductPromoCodeForm.register(
                    'discount_price_amount'
                  )}
                />
              </Field>
            </Stack>
            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideAppendCareProductPromoCodeModal}>
                取消
              </Button>
              <Button
                inversed
                variant="primary"
                onClick={appendCareProductPromoCodeForm.handleSubmit(
                  handleSubmitAppendCareProductPromoCodeForm
                )}
              >
                確定
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Modal>

      <Modal
        show={showDeleteCareProductPromoCodeModal}
        onHide={handleHideDeleteCareProductPromoCodeModal}
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
              <Label size="l">優惠方案</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideDeleteCareProductPromoCodeModal}
              />
            </Inline>
            <Stack fluid gap="xl">
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  優惠方案
                </Label>
                <Text>{selectedPromoCode?.program_name}</Text>
              </Field>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  優惠代碼
                </Label>
                <Text>{selectedPromoCode?.code}</Text>
              </Field>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  優惠折價
                </Label>
                <Text>
                  $
                  {getCommaSeparatedNumber(
                    watchSelectedCareProductPromoCode?.discount_price_amount
                  )}
                </Text>
              </Field>
            </Stack>
            <Button
              fluid
              size="s"
              variant="negative"
              onClick={() => {
                createCareProductFormCareProductPromoCodeFieldArray.remove(
                  selectedCareProductPromoCodeIndex
                )
                handleHideDeleteCareProductPromoCodeModal()
              }}
            >
              取消方案適用
            </Button>
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

export default AdminCreateProductPage
