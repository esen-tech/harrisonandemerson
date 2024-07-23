import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Display from '@esen/essence/components/Display'
import Divider from '@esen/essence/components/Divider'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import Textarea from '@esen/essence/components/Textarea'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { get_local_datetime, local_to_utc } from '@esen/utils/fn'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import OrganizationMarketingPageLayout from '../../../../components/layout/OrganizationMarketingPageLayout'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const MarketingIndexPage = () => {
  const router = useRouter()
  const createCooperationCodeForm = useForm()
  const [cooperation_codes, set_cooperation_codes] = useState([])
  const [activeCooperationCodeReference, setActiveCooperationCodeReference] =
    useState()
  const [activeCooperationCode, setActiveCooperationCode] = useState({})
  const { identifierKeys } = useInternalUser()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchCooperationCodes() {
      await harrisonApiAgent.get(
        `/marketing/organizations/${organization_uuid}/cooperation_codes`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_cooperation_codes(data)
          },
        }
      )
    }
    fetchCooperationCodes()
  }, [])

  useEffect(() => {
    async function fetchCooperationCode() {
      await harrisonApiAgent.get(
        `/marketing/organizations/${organization_uuid}/cooperation_codes/${activeCooperationCodeReference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            setActiveCooperationCode(data)
          },
        }
      )
    }
    if (activeCooperationCodeReference) {
      fetchCooperationCode()
    } else {
      setActiveCooperationCode(undefined)
    }
  }, [activeCooperationCodeReference])

  const handleSubmitCreateCooperationCodeForm = async (payload) => {
    await harrisonApiAgent.post(
      `/marketing/organizations/${organization_uuid}/cooperation_codes`,
      {
        ...payload,
        expiration_time: local_to_utc(payload.expiration_time),
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: async (_data) => {
          router.reload()
        },
      }
    )
  }

  const handleDeleteCooperationCodeClick = async (cooperationCodeReference) => {
    await harrisonApiAgent.delete(
      `/marketing/organizations/${organization_uuid}/cooperation_codes/${cooperationCodeReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: async (_data) => {
          router.reload()
        },
      }
    )
  }

  return (
    <OrganizationMarketingPageLayout>
      <Container
        variant="tertiary"
        size={false}
        fluid
        as={Inline}
        grow={1}
        alignItems="stretch"
      >
        <Stack basis="50%" alignItems="center" justifyContent="center">
          <Container
            style={{ width: 352, position: 'sticky', top: 32, bottom: 32 }}
          >
            <Stack fluid>
              <Spacer ySize="xl" />

              <Inline fluid>
                <Spacer xSize="xl" />
                <Stack gap="xl" fluid>
                  <Display size="s">建立方案</Display>

                  <Form
                    fluid
                    onSubmit={createCooperationCodeForm.handleSubmit(
                      handleSubmitCreateCooperationCodeForm
                    )}
                  >
                    <Stack gap="l" fluid>
                      <Stack gap="s" fluid>
                        <Field fluid>
                          <Input
                            fluid
                            placeholder="公司/KOL名稱/活動名稱"
                            {...createCooperationCodeForm.register(
                              'entity_name'
                            )}
                          />
                        </Field>
                        <Field fluid>
                          <Input
                            fluid
                            placeholder="優惠代碼"
                            {...createCooperationCodeForm.register('code')}
                          />
                        </Field>
                        <Field fluid>
                          <Input
                            type="datetime-local"
                            fluid
                            placeholder="有效期限"
                            {...createCooperationCodeForm.register(
                              'expiration_time'
                            )}
                          />
                        </Field>
                      </Stack>

                      <Field as={Stack} fluid gap="xs">
                        <Label size="s" variant="secondary">
                          營運須知
                        </Label>
                        <Textarea
                          fluid
                          placeholder="輸入營運須知"
                          {...createCooperationCodeForm.register(
                            'operation_remark'
                          )}
                        />
                      </Field>

                      <Button
                        fluid
                        inversed
                        variant="primary"
                        disabled={
                          !identifierKeys.includes(
                            IDENTIFIER_KEY.MARKETING_EDITOR
                          )
                        }
                      >
                        產生代碼
                      </Button>
                    </Stack>
                  </Form>
                </Stack>
                <Spacer xSize="xl" />
              </Inline>
              <Spacer ySize="xl" />
            </Stack>
          </Container>
        </Stack>
        <Stack basis="50%">
          <Container fluid fill size="xl">
            <Stack fluid>
              <Spacer ySize="xl" />
              <Spacer ySize="xl" />
              <Inline fluid>
                <Spacer xSize="s" />
                <Stack fluid gap="xl">
                  <Display size="l">現行方案</Display>
                  <Stack fluid>
                    <WithSeparator separator={<Divider indention="all" />}>
                      {cooperation_codes.map((cooperation_code) => {
                        const local_now = new Date()
                        const local_expiration_time = new Date(
                          get_local_datetime(
                            cooperation_code.expiration_time,
                            'yyyy-MM-dd HH:mm:ss'
                          )
                        )
                        const isExpired = local_now >= local_expiration_time
                        return (
                          <ListItem
                            key={cooperation_code.reference}
                            controlScope="all"
                            onClick={() =>
                              setActiveCooperationCodeReference(
                                cooperation_code.reference
                              )
                            }
                          >
                            <ListItem.Content
                              title={cooperation_code.entity_name}
                              paragraph={cooperation_code.code}
                              metadata={[
                                <>
                                  <Icon name="schedule" fill={false} />
                                  {get_local_datetime(
                                    cooperation_code.expiration_time,
                                    'yyyy-MM-dd HH:mm:ss'
                                  )}
                                </>,
                              ]}
                            />
                            <ListItem.Control
                              badge={{
                                variant: isExpired ? 'secondary' : 'positive',
                                children: isExpired ? 'Expired' : 'Live',
                              }}
                              icon
                            />
                          </ListItem>
                        )
                      })}
                    </WithSeparator>
                  </Stack>
                </Stack>
                <Spacer xSize="s" />
              </Inline>
            </Stack>
          </Container>
        </Stack>
      </Container>

      <Modal
        verticallyCentered
        show={activeCooperationCodeReference !== undefined}
        onHide={() => setActiveCooperationCodeReference(undefined)}
      >
        <Container style={{ width: 602 }}>
          <Stack fluid>
            <Spacer ySize="xl" />
            <Inline fluid>
              <Spacer xSize="xl" />
              <Stack gap="xl" fluid>
                <Inline fluid justifyContent="space-between">
                  <Heading size="l">活動方案</Heading>
                  <Icon
                    style={{ cursor: 'pointer' }}
                    name="close"
                    sizeInPixel={24}
                    onClick={() => setActiveCooperationCodeReference(undefined)}
                  />
                </Inline>
                <Stack fluid>
                  <WithSeparator trailing separator={<Divider indention="y" />}>
                    <Container>
                      <Stack gap="s">
                        <Label size="m" variant="tertiary">
                          公司/KOL名稱/活動名稱
                        </Label>
                        <Text size="s">
                          {activeCooperationCode?.entity_name}
                        </Text>
                      </Stack>
                    </Container>
                    <Container>
                      <Stack gap="s">
                        <Label size="m" variant="tertiary">
                          優惠代碼
                        </Label>
                        <Text size="s">{activeCooperationCode?.code}</Text>
                      </Stack>
                    </Container>
                    <Container>
                      <Stack gap="s">
                        <Label size="m" variant="tertiary">
                          有效期限
                        </Label>
                        <Text size="s">
                          {get_local_datetime(
                            activeCooperationCode?.expiration_time,
                            'yyyy-MM-dd HH:mm:ss'
                          )}
                        </Text>
                      </Stack>
                    </Container>
                    <Container>
                      <Stack gap="s">
                        <Label size="m" variant="tertiary">
                          營運須知
                        </Label>
                        <Text size="s" multiLine>
                          {activeCooperationCode?.operation_remark}
                        </Text>
                      </Stack>
                    </Container>
                  </WithSeparator>
                </Stack>
                <Button
                  fluid
                  variant="negative"
                  onClick={() =>
                    handleDeleteCooperationCodeClick(
                      activeCooperationCodeReference
                    )
                  }
                  disabled={
                    !identifierKeys.includes(IDENTIFIER_KEY.MARKETING_EDITOR)
                  }
                >
                  刪除活動
                </Button>
              </Stack>
              <Spacer xSize="xl" />
            </Inline>
            <Spacer ySize="xl" />
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

export default MarketingIndexPage
