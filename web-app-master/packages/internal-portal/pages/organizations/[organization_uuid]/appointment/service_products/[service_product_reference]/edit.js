import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import Textarea from '@esen/essence/components/Textarea'
import { NHI_INSURER_REFERENCE } from '@esen/utils/constants/insurer'
import { EMPLOYMENT_STATE } from '@esen/utils/constants/state'
import { get_full_name, get_local_datetime, local_to_utc } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import OrganizationAppointmentPageLayout from '../../../../../../components/layout/OrganizationAppointmentPageLayout'
import Page from '../../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../../utils/apiAgent'

const AppointmentEditServiceProductPage = () => {
  const router = useRouter()
  const { organization_uuid, service_product_reference } = router.query
  const updateServiceProductForm = useForm()
  const updateServiceProductFormServiceProductInternalUserFieldArray =
    useFieldArray({
      control: updateServiceProductForm.control,
      name: 'service_product_internal_users',
    })
  const appendServiceProductInternalUserForm = useForm()
  const [
    showAppendServiceProductInternalUserModal,
    setShowAppendServiceProductInternalUserModal,
  ] = useState(false)
  const [
    selectedServiceProductInternalUserIndex,
    setSelectedServiceProductInternalUserIndex,
  ] = useState()
  const [
    showDeleteServiceProductInternalUserModal,
    setShowDeleteServiceProductInternalUserModal,
  ] = useState(false)
  const [organization_internal_users, set_organization_internal_users] =
    useState([])
  const [service_product, set_service_product] = useState()
  const watchSelectedServiceProductInternalUser =
    updateServiceProductForm.watch(
      `service_product_internal_users.${selectedServiceProductInternalUserIndex}`
    )
  const organizationInternalUserMap = organization_internal_users.reduce(
    (m, oiu) => ({ ...m, [oiu.internal_user.reference]: oiu }),
    {}
  )
  const appendedServiceProductInternalUserReferences = updateServiceProductForm
    .getValues()
    ?.['service_product_internal_users']?.map(
      (spiu) => spiu.internal_user_reference
    )
  const selectedOrganizationInternalUser =
    organizationInternalUserMap[
      watchSelectedServiceProductInternalUser?.internal_user_reference
    ]

  const handleHideAppendServiceProductInternalUserModal = () => {
    setShowAppendServiceProductInternalUserModal(false)
  }

  const handleHideDeleteServiceProductInternalUserModal = () => {
    setSelectedServiceProductInternalUserIndex(null)
    setShowDeleteServiceProductInternalUserModal(false)
  }

  const handleSubmitAppendServiceProductInternalUserForm = async (payload) => {
    payload.internal_user_references.forEach((internal_user_reference) => {
      updateServiceProductFormServiceProductInternalUserFieldArray.append({
        internal_user_reference,
      })
    })
    handleHideAppendServiceProductInternalUserModal()
  }

  useEffect(() => {
    async function fetchServiceProduct() {
      await harrisonApiAgent.get(
        `/product/service_products/${service_product_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_service_product(data)
          },
        }
      )
    }
    if (service_product_reference) {
      fetchServiceProduct()
    }
  }, [service_product_reference])

  useEffect(() => {
    async function fetchOrganizationInternalUsers() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization_uuid}/organization_internal_users`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_organization_internal_users(enhanced_data)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchOrganizationInternalUsers()
    }
  }, [organization_uuid])

  // restore states of existing appointment
  useEffect(() => {
    if (service_product) {
      updateServiceProductForm.reset({
        display_sku_key: service_product.display_sku_key,
        display_description_key: service_product.display_description_key,
        display_note: service_product.display_note,
        effective_time: get_local_datetime(
          service_product.effective_time,
          'yyyy-MM-dd HH:mm:ss'
        ),
        expire_time: get_local_datetime(
          service_product.expire_time,
          'yyyy-MM-dd HH:mm:ss'
        ),
        registration_fee_amount: service_product.registration_fee_amount,
        durationInMinutes: service_product.duration_in_time_slots * 5,
        insuranceType:
          service_product.service_product_insurers.length > 0
            ? 'nhi_covered'
            : 'non_covered',
        service_product_insurers: service_product.service_product_insurers,
        service_product_internal_users:
          service_product.service_product_internal_users,
      })
    }
  }, [service_product])

  const handleSubmitUpdateServiceProductForm = async (payload) => {
    await harrisonApiAgent.patch(
      `/product/organizations/${organization_uuid}/service_products/${service_product_reference}`,
      {
        ...payload,
        effective_time: local_to_utc(payload.effective_time),
        expire_time: local_to_utc(payload.expire_time),
        duration_in_time_slots: payload.durationInMinutes / 5,
        service_product_insurers:
          payload.insuranceType === 'nhi_covered'
            ? [{ insurer_reference: NHI_INSURER_REFERENCE }]
            : [],
      },
      {
        onFail: (_status, data) => {
          alert(data?.message)
        },
        onSuccess: (data) => {
          router.push(
            `/organizations/${organization_uuid}/appointment/service_products`
          )
        },
      }
    )
  }

  return (
    <OrganizationAppointmentPageLayout>
      <Page>
        <Page.Header
          title="編輯門診服務"
          rightControl={
            <Inline gap="s">
              <Button
                onClick={() =>
                  router.push(
                    `/organizations/${organization_uuid}/appointment/service_products`
                  )
                }
              >
                取消編輯
              </Button>
              <Button
                variant="primary"
                inversed
                onClick={updateServiceProductForm.handleSubmit(
                  handleSubmitUpdateServiceProductForm
                )}
              >
                儲存編輯
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
                    <Heading size="m">服務資訊</Heading>
                    <Text size="s" variant="tertiary">
                      關於商品的所有資訊
                    </Text>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">服務名稱</Heading>
                    <Input
                      fluid
                      placeholder="填入服務名稱"
                      {...updateServiceProductForm.register('display_sku_key')}
                    />
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">服務內容</Heading>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        掛號費用
                      </Label>
                      <Input
                        fluid
                        placeholder="填入掛號費用"
                        type="number"
                        {...updateServiceProductForm.register(
                          'registration_fee_amount'
                        )}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        門診長度（分鐘）
                      </Label>
                      <Input
                        fluid
                        placeholder="填入門診長度"
                        type="number"
                        {...updateServiceProductForm.register(
                          'durationInMinutes',
                          {
                            validate: {
                              matchQuantization: (v) =>
                                v % 5 === 0 || '必須以5分鐘為一單位',
                            },
                          }
                        )}
                      />
                      {updateServiceProductForm.formState.errors
                        .durationInMinutes ? (
                        <Text size="xs" variant="negative">
                          {
                            updateServiceProductForm.formState.errors
                              .durationInMinutes.message
                          }
                        </Text>
                      ) : (
                        <Label size="xs" variant="secondary">
                          需為5分鐘的倍數！
                        </Label>
                      )}
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        服務描述
                      </Label>
                      <Textarea
                        fluid
                        placeholder="填入服務描述"
                        {...updateServiceProductForm.register(
                          'display_description_key'
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
                        {...updateServiceProductForm.register('display_note')}
                      />
                    </Field>
                  </Stack>
                </Stack>
              </Page.Section>
            </Grid.Area>
            <Grid.Area columnSpan={5}>
              <Page.Section inset>
                <Stack gap="xxl">
                  <Stack>
                    <Heading size="m">服務設定</Heading>
                    <Text size="s" variant="tertiary">
                      關於商品的所有數值設定
                    </Text>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">健保/自費</Heading>
                    <Inline fluid gap="m">
                      <Field fluid>
                        <Input
                          {...updateServiceProductForm.register(
                            'insuranceType'
                          )}
                          type="radio"
                          id="nhi_covered"
                          value="nhi_covered"
                        />
                        <label htmlFor="nhi_covered">健保</label>
                      </Field>
                      <Field fluid>
                        <Input
                          {...updateServiceProductForm.register(
                            'insuranceType'
                          )}
                          type="radio"
                          id="non_covered"
                          value="non_covered"
                        />
                        <label htmlFor="non_covered">自費</label>
                      </Field>
                    </Inline>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">服務上架期間</Heading>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        服務生效日期
                      </Label>
                      <Input
                        fluid
                        type="datetime-local"
                        {...updateServiceProductForm.register('effective_time')}
                      />
                    </Field>
                    <Field as={Stack} fluid>
                      <Label size="s" variant="secondary">
                        服務過期日期
                      </Label>
                      <Input
                        fluid
                        type="datetime-local"
                        {...updateServiceProductForm.register('expire_time')}
                      />
                    </Field>
                  </Stack>
                  <Stack gap="l" fluid>
                    <Heading size="s">服務人員</Heading>
                    {updateServiceProductFormServiceProductInternalUserFieldArray.fields.map(
                      (field, idx) => {
                        const values = updateServiceProductForm.getValues()
                        const service_product_internal_user =
                          values.service_product_internal_users[idx]
                        const organization_internal_user =
                          organizationInternalUserMap[
                            service_product_internal_user
                              .internal_user_reference
                          ]
                        const isEmployed =
                          organization_internal_user?.employment_state ===
                          EMPLOYMENT_STATE.EMPLOYED
                        const badge = {
                          variant: isEmployed ? 'positive' : 'negative',
                          children: isEmployed ? '在職中' : '不在職',
                        }

                        return (
                          <ListItem
                            key={field.id}
                            verticallyCentered
                            controlScope="all"
                            onClick={() => {
                              setSelectedServiceProductInternalUserIndex(idx)
                              setShowDeleteServiceProductInternalUserModal(true)
                            }}
                          >
                            <ListItem.Media
                              image={{
                                src: organization_internal_user?.internal_user
                                  ?.avatar_src,
                              }}
                            />
                            <ListItem.Content
                              title={get_full_name(
                                organization_internal_user?.internal_user
                              )}
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
                        appendServiceProductInternalUserForm.reset({
                          internal_user_references: [],
                        })
                        setShowAppendServiceProductInternalUserModal(true)
                      }}
                    >
                      新增人員
                    </Button>
                  </Stack>
                </Stack>
              </Page.Section>
            </Grid.Area>
          </Grid>
        </Container>
      </Page>

      <Modal
        show={showAppendServiceProductInternalUserModal}
        onHide={handleHideAppendServiceProductInternalUserModal}
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
            <Stack fluid gap="xl">
              <Field as={Stack} fluid>
                <Controller
                  control={appendServiceProductInternalUserForm.control}
                  name="internal_user_references"
                  render={({ field }) => (
                    <DropdownSelect
                      fluid
                      multiple
                      options={organization_internal_users
                        .filter(
                          (oiu) =>
                            !appendedServiceProductInternalUserReferences.includes(
                              oiu.internal_user.reference
                            )
                        )
                        .map((oiu) => ({
                          label: get_full_name(oiu.internal_user),
                          value: oiu.internal_user.reference,
                        }))}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
            </Stack>
            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideAppendServiceProductInternalUserModal}>
                取消
              </Button>
              <Button
                inversed
                variant="primary"
                onClick={appendServiceProductInternalUserForm.handleSubmit(
                  handleSubmitAppendServiceProductInternalUserForm
                )}
              >
                確定
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Modal>

      <Modal
        show={showDeleteServiceProductInternalUserModal}
        onHide={handleHideDeleteServiceProductInternalUserModal}
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
              <Label size="l">服務人員</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideDeleteServiceProductInternalUserModal}
              />
            </Inline>
            <Stack fluid gap="xl">
              <ListItem verticallyCentered>
                <ListItem.Media
                  image={{
                    src: selectedOrganizationInternalUser?.internal_user
                      ?.avatar_src,
                  }}
                />
                <ListItem.Content
                  title={get_full_name(
                    selectedOrganizationInternalUser?.internal_user
                  )}
                />
                <ListItem.Control
                  badge={{
                    variant:
                      selectedOrganizationInternalUser?.employment_state ===
                      EMPLOYMENT_STATE.EMPLOYED
                        ? 'positive'
                        : 'negative',
                    children:
                      selectedOrganizationInternalUser?.employment_state ===
                      EMPLOYMENT_STATE.EMPLOYED
                        ? '在職中'
                        : '不在職',
                  }}
                />
              </ListItem>
            </Stack>
            <Button
              fluid
              size="s"
              variant="negative"
              onClick={() => {
                updateServiceProductFormServiceProductInternalUserFieldArray.remove(
                  selectedServiceProductInternalUserIndex
                )
                handleHideDeleteServiceProductInternalUserModal()
              }}
            >
              移除此人
            </Button>
          </Stack>
        </Container>
      </Modal>
    </OrganizationAppointmentPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AppointmentEditServiceProductPage
