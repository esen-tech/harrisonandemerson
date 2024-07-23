import Button from '@esen/essence/components/Button'
import Divider from '@esen/essence/components/Divider'
import Form from '@esen/essence/components/Form'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import ListItem from '@esen/essence/components/ListItem'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import WithSeparator from '@esen/essence/components/WithSeparator'
import {
  operationalStateMap,
  OPERATIONAL_STATE_ENUM,
} from '@esen/utils/constants/organization'
import { get_full_name } from '@esen/utils/fn'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { useInternalUserCollection } from '@esen/utils/hooks/useInternalUserCollection'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import OrganizationAdminPageLayout from '../../../../components/layout/OrganizationAdminPageLayout'
import Page from '../../../../components/Page'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const AdminOrganizationPage = () => {
  const { tab, setTab } = useRouterTab('診所資訊')
  const [organization, set_organization] = useState([])
  const internalUserCollection = useInternalUserCollection()
  const { identifierKeys } = useInternalUser()
  const editOrganizationForm = useForm()
  const router = useRouter()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchOrganizationDetail() {
      await harrisonApiAgent.get(`/iam/organizations/${organization_uuid}`, {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_organization(data)
        },
      })
    }
    if (organization_uuid) {
      fetchOrganizationDetail()
    }
  }, [organization_uuid])

  useEffect(() => {
    if (organization.registered_representative_internal_user_reference) {
      internalUserCollection.addReference(
        organization.registered_representative_internal_user_reference
      )
    }
  }, [organization.registered_representative_internal_user_reference])

  useEffect(() => {
    if (organization) {
      editOrganizationForm.setValue('display_key', organization.display_key)
      editOrganizationForm.setValue('branch_key', organization.branch_key)
      editOrganizationForm.setValue(
        'correspondence_address',
        organization.correspondence_address
      )
      editOrganizationForm.setValue('phone_number', organization.phone_number)
      editOrganizationForm.setValue('banner_src', organization.banner_src)
    }
  }, [organization])

  const onSubmitUpdateOrganizationForm = async (payload) => {
    await harrisonApiAgent.patch(
      `/iam/organizations/${organization_uuid}`,
      payload,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: () => {
          router.reload()
        },
      }
    )
  }

  const handleToggleOperationalState = async () => {
    let payload
    if (organization.operational_state === OPERATIONAL_STATE_ENUM.OPEN) {
      payload = {
        operational_state: OPERATIONAL_STATE_ENUM.OUT_OF_BUSINESS,
      }
    } else if (
      organization.operational_state === OPERATIONAL_STATE_ENUM.OUT_OF_BUSINESS
    ) {
      payload = {
        operational_state: OPERATIONAL_STATE_ENUM.OPEN,
      }
    }
    await harrisonApiAgent.patch(
      `/iam/organizations/${organization_uuid}`,
      payload,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: () => {
          router.reload()
        },
      }
    )
  }

  const registeredRepresentativeInternalUser =
    internalUserCollection.map[
      organization.registered_representative_internal_user_reference
    ]

  return (
    <OrganizationAdminPageLayout>
      <Page>
        <Page.Header
          title="組織管理"
          tab={
            <Tab type="underline">
              <Tab.Item
                active={tab === '診所資訊'}
                onClick={() => setTab('診所資訊')}
              >
                診所資訊
              </Tab.Item>
              <Tab.Item
                active={tab === '診所開業資料'}
                onClick={() => setTab('診所開業資料')}
              >
                診所開業資料
              </Tab.Item>
            </Tab>
          }
        />

        {tab === '診所資訊' && (
          <Page.Section>
            <Stack gap="xl">
              <Heading size="m">診所資訊</Heading>
              <Form fluid>
                <Grid fluid columns={12} columnGap="l" rowGap="xl">
                  <WithSeparator
                    separator={
                      <Grid.Area columnSpan={8}>
                        <Divider />
                      </Grid.Area>
                    }
                  >
                    <Grid.Area columnSpan={8}>
                      <Grid columns={8} columnGap="l">
                        <Grid.Area columnSpan={2} alignSelf="center">
                          <Heading size="s">機構名稱</Heading>
                        </Grid.Area>
                        <Grid.Area columnSpan={3}>
                          <Input
                            fluid
                            {...editOrganizationForm.register('display_key')}
                          />
                        </Grid.Area>
                        <Grid.Area columnSpan={3}>
                          <Input
                            fluid
                            {...editOrganizationForm.register('branch_key')}
                          />
                        </Grid.Area>
                      </Grid>
                    </Grid.Area>
                    <Grid.Area columnSpan={8}>
                      <Grid columns={8} columnGap="l">
                        <Grid.Area columnSpan={2} alignSelf="center">
                          <Heading size="s">診所地址</Heading>
                        </Grid.Area>
                        <Grid.Area columnSpan={6}>
                          <Input
                            fluid
                            {...editOrganizationForm.register(
                              'correspondence_address'
                            )}
                          />
                        </Grid.Area>
                      </Grid>
                    </Grid.Area>
                    <Grid.Area columnSpan={8}>
                      <Grid columns={8} columnGap="l">
                        <Grid.Area columnSpan={2} alignSelf="center">
                          <Heading size="s">診所電話</Heading>
                        </Grid.Area>
                        <Grid.Area columnSpan={6}>
                          <Input
                            fluid
                            {...editOrganizationForm.register('phone_number')}
                          />
                        </Grid.Area>
                      </Grid>
                    </Grid.Area>
                    <Grid.Area columnSpan={8}>
                      <Grid columns={8} columnGap="l">
                        <Grid.Area columnSpan={2}>
                          <Spacer ySize="m" />
                          <Heading size="s">診所封面圖片</Heading>
                        </Grid.Area>
                        <Grid.Area columnSpan={6}>
                          <Input
                            fluid
                            placeholder="https://image.somewhere.com"
                            {...editOrganizationForm.register('banner_src')}
                          />
                          <Text size="xs" variant="secondary">
                            目前系統尚不支援圖檔上傳，因此請於第三方平台上傳後貼入網址，謝謝。
                          </Text>
                        </Grid.Area>
                      </Grid>
                    </Grid.Area>
                  </WithSeparator>
                </Grid>
              </Form>
            </Stack>
          </Page.Section>
        )}

        {tab === '診所資訊' &&
          identifierKeys.includes(IDENTIFIER_KEY.ORGANIZATION_EDITOR) && (
            <Page.Footer>
              <Inline gap="s">
                <Button
                  variant="primary"
                  inversed
                  onClick={editOrganizationForm.handleSubmit(
                    onSubmitUpdateOrganizationForm
                  )}
                >
                  儲存變更
                </Button>
                <Button
                  onClick={() => {
                    router.reload()
                  }}
                >
                  取消變更
                </Button>
              </Inline>
            </Page.Footer>
          )}

        {tab === '診所開業資料' && (
          <Page.Section>
            <Stack gap="xl">
              <Heading size="m">診所開業資料</Heading>
              <Grid fluid columns={12} columnGap="l" rowGap="l">
                <WithSeparator
                  separator={
                    <Grid.Area columnSpan={8}>
                      <Divider />
                    </Grid.Area>
                  }
                >
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">機構名稱</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem>
                          <ListItem.Content
                            title={organization.registered_name}
                            paragraph={organization.registered_address}
                          />
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">診療科別</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem>
                          <ListItem.Content
                            title={organization.registered_medical_specialty}
                          />
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">機構代碼</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem>
                          <ListItem.Content
                            title={organization.registered_organization_code}
                          />
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">負責人</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem>
                          <ListItem.Content
                            title={get_full_name(
                              registeredRepresentativeInternalUser
                            )}
                            paragraph={
                              registeredRepresentativeInternalUser?.email_address
                            }
                          />
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">開業日期</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem>
                          <ListItem.Content
                            title={
                              organization.registered_business_commencement_date
                            }
                          />
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                  <Grid.Area columnSpan={8}>
                    <Grid columns={8} columnGap="l">
                      <Grid.Area columnSpan={2}>
                        <Spacer ySize="m" />
                        <Heading size="s">開業狀態</Heading>
                      </Grid.Area>
                      <Grid.Area columnSpan={6}>
                        <ListItem controlScope="control">
                          <ListItem.Content
                            title={
                              operationalStateMap[
                                organization.operational_state
                              ]
                            }
                            titleProps={
                              {
                                [OPERATIONAL_STATE_ENUM.OPEN]: {
                                  variant: 'positive',
                                },
                                [OPERATIONAL_STATE_ENUM.OUT_OF_BUSINESS]: {
                                  variant: 'negative',
                                },
                              }[organization.operational_state]
                            }
                          />
                          {identifierKeys.includes(
                            IDENTIFIER_KEY.ORGANIZATION_EDITOR
                          ) && (
                            <ListItem.Control
                              icon={
                                {
                                  [OPERATIONAL_STATE_ENUM.OPEN]: {
                                    name: 'toggle_on',
                                  },
                                  [OPERATIONAL_STATE_ENUM.OUT_OF_BUSINESS]: {
                                    name: 'toggle_off',
                                  },
                                }[organization.operational_state]
                              }
                              onClick={handleToggleOperationalState}
                            />
                          )}
                        </ListItem>
                      </Grid.Area>
                    </Grid>
                  </Grid.Area>
                </WithSeparator>
              </Grid>
            </Stack>
          </Page.Section>
        )}
      </Page>
    </OrganizationAdminPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AdminOrganizationPage
