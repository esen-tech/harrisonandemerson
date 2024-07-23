import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Field from '@esen/essence/components/Field'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { get_local_datetime, local_to_utc } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import OrganizationMarketingPageLayout from '../../../../components/layout/OrganizationMarketingPageLayout'
import Page from '../../../../components/Page'
import SidePanel from '../../../../components/SidePanel'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const MarketingPromoCodesPage = () => {
  const paginator = usePaginator()
  const [promo_codes, set_promo_codes] = useState([])
  const [active_promo_code, set_active_promo_code] = useState()
  const [activePromoCodeReference, setActivePromoCodeReference] = useState()
  const [showCreatePromoCodeModal, setShowCreatePromoCodeModal] =
    useState(false)
  const { identifierKeys } = useInternalUser()
  const router = useRouter()
  const createPromoCodeForm = useForm()
  const { organization_uuid } = router.query

  async function fetchPromoCode(promoCodeReference) {
    await harrisonApiAgent.get(
      `/marketing/organizations/${organization_uuid}/promo_codes/${promoCodeReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_active_promo_code(data)
        },
      }
    )
  }

  useEffect(() => {
    async function fetchPromoCodes() {
      await harrisonApiAgent.get(
        `/marketing/organizations/${organization_uuid}/promo_codes`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_promo_codes(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchPromoCodes()
    }
  }, [organization_uuid, paginator.activePageToken])

  useEffect(() => {
    if (activePromoCodeReference) {
      fetchPromoCode(activePromoCodeReference)
    }
  }, [activePromoCodeReference])

  const handleHideCreatePromoCodeModal = () => {
    setShowCreatePromoCodeModal(false)
    createPromoCodeForm.reset({
      program_name: null,
      code: null,
      effective_time: null,
      expiration_time: null,
    })
  }

  const handleSubmitCreatePromoCodeForm = async (payload) => {
    await harrisonApiAgent.post(
      `/marketing/organizations/${organization_uuid}/promo_codes`,
      {
        ...payload,
        effective_time: local_to_utc(payload.effective_time),
        expiration_time: local_to_utc(payload.expiration_time),
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

  const handleDeletePromoCodeClick = async () => {
    await harrisonApiAgent.delete(
      `/marketing/organizations/${organization_uuid}/promo_codes/${activePromoCodeReference}`,
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
    <OrganizationMarketingPageLayout>
      <Page>
        <Page.Header
          title="優惠代碼"
          rightControl={
            identifierKeys.includes(IDENTIFIER_KEY.MARKETING_EDITOR) ? (
              <Button
                variant="primary"
                inversed
                prefix={<Icon inversed name="add" />}
                onClick={() => setShowCreatePromoCodeModal(true)}
              >
                新增優惠代碼
              </Button>
            ) : null
          }
        />
        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>
                  <Label size="s" variant="tertiary">
                    方案名稱
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    優惠代碼
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    生效日期
                  </Label>
                </Table.Th>
                <Table.Th>
                  <Label size="s" variant="tertiary">
                    過期日期
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
              {promo_codes.map((promo_code) => {
                const local_now = new Date()
                const local_effective_time = new Date(
                  get_local_datetime(
                    promo_code.effective_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const local_expiration_time = new Date(
                  get_local_datetime(
                    promo_code.expiration_time,
                    'yyyy-MM-dd HH:mm:ss'
                  )
                )
                const isNotStarted = local_now < local_effective_time
                const isExpired = local_expiration_time <= local_now
                return (
                  <Table.Tr
                    key={promo_code.reference}
                    pointer
                    onClick={() =>
                      setActivePromoCodeReference(promo_code.reference)
                    }
                  >
                    <Table.Td leftIndent>
                      <Text size="s">{promo_code.program_name}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="s">{promo_code.code}</Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="s">
                        {get_local_datetime(
                          promo_code.effective_time,
                          'yyyy-MM-dd'
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="s">
                        {get_local_datetime(
                          promo_code.expiration_time,
                          'yyyy-MM-dd'
                        )}
                      </Text>
                    </Table.Td>
                    <Table.Td rightIndent>
                      <Text size="s">
                        <Badge
                          variant={
                            isNotStarted
                              ? 'secondary'
                              : isExpired
                              ? 'secondary'
                              : 'positive'
                          }
                        >
                          {isNotStarted && '未開始'}
                          {isExpired && '已過期'}
                          {!isNotStarted && !isExpired && '進行中'}
                        </Badge>
                      </Text>
                    </Table.Td>
                  </Table.Tr>
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
                          promo_codes.length ===
                        paginator.activePage?.count_all_page
                      return defaultIsNextDisabled || isLastPage
                    }
                  )}
                />
              </Inline>
            </Inline>
          </Inline>
        </Page.Footer>

        {activePromoCodeReference && (
          <Page.SidePanel
            title="方案細節"
            onClose={() => setActivePromoCodeReference()}
          >
            <SidePanel.Section title="方案名稱">
              <Container>
                <Text>{active_promo_code?.program_name || 'N/A'}</Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="優惠代碼">
              <Container>
                <Text>{active_promo_code?.code || 'N/A'}</Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="生效日期">
              <Container>
                <Text>
                  {active_promo_code &&
                    get_local_datetime(
                      active_promo_code.effective_time,
                      'yyyy-MM-dd HH:mm:ss'
                    )}
                </Text>
              </Container>
            </SidePanel.Section>
            <SidePanel.Section title="過期日期">
              <Container>
                <Text>
                  {active_promo_code &&
                    get_local_datetime(
                      active_promo_code.expiration_time,
                      'yyyy-MM-dd HH:mm:ss'
                    )}
                </Text>
              </Container>
            </SidePanel.Section>
            {identifierKeys.includes(IDENTIFIER_KEY.MARKETING_EDITOR) && (
              <SidePanel.Section>
                <Container fluid>
                  <Button
                    fluid
                    variant="negative"
                    onClick={handleDeletePromoCodeClick}
                  >
                    刪除活動
                  </Button>
                </Container>
              </SidePanel.Section>
            )}
          </Page.SidePanel>
        )}
      </Page>

      <Modal
        show={showCreatePromoCodeModal}
        onHide={handleHideCreatePromoCodeModal}
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
              <Label size="l">新增方案</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideCreatePromoCodeModal}
              />
            </Inline>
            <Stack fluid>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  方案名稱
                </Label>
                <Input
                  fluid
                  placeholder="填入方案名稱"
                  {...createPromoCodeForm.register('program_name')}
                />
              </Field>
            </Stack>
            <Stack fluid>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  方案代碼
                </Label>
                <Input
                  fluid
                  placeholder="填入方案代碼"
                  {...createPromoCodeForm.register('code')}
                />
              </Field>
            </Stack>
            <Stack fluid>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  生效日期
                </Label>
                <Input
                  type="datetime-local"
                  fluid
                  placeholder="填入生效日期"
                  {...createPromoCodeForm.register('effective_time')}
                />
              </Field>
            </Stack>
            <Stack fluid>
              <Field as={Stack} fluid>
                <Label size="s" variant="secondary">
                  過期日期
                </Label>
                <Input
                  type="datetime-local"
                  fluid
                  placeholder="填入過期日期"
                  {...createPromoCodeForm.register('expiration_time')}
                />
              </Field>
            </Stack>
            <Inline fluid gap="s" justifyContent="end">
              <Button onClick={handleHideCreatePromoCodeModal}>取消</Button>
              <Button
                inversed
                variant="primary"
                onClick={createPromoCodeForm.handleSubmit(
                  handleSubmitCreatePromoCodeForm
                )}
                loading={createPromoCodeForm.formState.isSubmitting}
              >
                確定
              </Button>
            </Inline>
          </Stack>
        </Container>
      </Modal>
    </OrganizationMarketingPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default MarketingPromoCodesPage
