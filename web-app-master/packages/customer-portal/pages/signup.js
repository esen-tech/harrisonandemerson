import Icon from '@esen/components/Icon'
import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Heading from '@esen/essence/components/Heading'
import Hyperlink from '@esen/essence/components/Hyperlink'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Progress from '@esen/essence/components/Progress'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import { genderMap, GENDER_ENUM } from '@esen/utils/constants/user'
import { normalize_phone_number } from '@esen/utils/functions/form'
import { useCountdown } from '@esen/utils/hooks'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import useTrack from '@esen/utils/hooks/useTrack'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import Banner from '../components/Banner'
import Footer from '../components/Footer'
import AppLayout from '../components/layout/AppLayout'
import { emersonApiAgent } from '../utils/apiAgent'
import { is_otp_valid, is_phone_number_valid } from '../utils/fns'

const Stage = {
  CREATE_SIGNUP_INTENT: 'CREATE_SIGNUP_INTENT',
  VERIFY_SIGNUP_INTENT: 'VERIFY_SIGNUP_INTENT',
  SIGNUP: 'SIGNUP',
}

const STEP_COUNT = 2

const SignupPage = () => {
  const router = useRouter()
  const [track] = useTrack()
  const [tab, setTab] = useState('手機註冊')
  const [activeStep, setActiveStep] = useState(0)
  const [stage, set_stage] = useState(Stage.CREATE_SIGNUP_INTENT)
  const [resend_otp_remaining_seconds, reset_resend_otp_countdown] =
    useCountdown(300)
  const [token, set_token] = useState()
  // const [consent_resources, set_consent_resources] = useState([])
  const createSignupIntentForm = useForm({
    mode: 'onBlur',
    defaultValues: { countryCode: '+886' },
  })
  const verifySignupIntentForm = useForm()
  const signupForm = useForm()
  const { fetchEndUser } = useEndUser()

  const watchCountryCode = createSignupIntentForm.watch('countryCode')
  const watchNationalPhoneNumber = createSignupIntentForm.watch(
    'nationalPhoneNumber'
  )
  const watchEmailAddress = createSignupIntentForm.watch('emailAddress')
  const watch_one_time_password =
    verifySignupIntentForm.watch('one_time_password')
  // const watch_consent_resouece = signupForm.watch('consent_resouece')
  // const consent_resouece_values = Object.values(watch_consent_resouece || [])
  // const agree_to_all_consent_resources =
  //   consent_resouece_values.length > 0 &&
  //   consent_resouece_values.every((cr) => cr === true)

  // useEffect(() => {
  //   async function fetch_consent_resources() {
  //     await apiAgent.get('/consent_resources/available', {
  //       onFail: (status, data) => {
  //         alert(data.message)
  //       },
  //       onSuccess: (data) => {
  //         set_consent_resources(data)
  //       },
  //     })
  //   }
  //   fetch_consent_resources()
  // }, [])

  const handleSubmitCreateSignupIntentForm = async (payload) => {
    const { countryCode, nationalPhoneNumber, emailAddress } = payload
    track('submit-create-signup-intent-form')
    reset_resend_otp_countdown()
    let data = {}
    if (tab === '手機註冊') {
      data['phone_number'] = normalize_phone_number(
        countryCode,
        nationalPhoneNumber
      )
    } else if (tab === 'Email註冊') {
      data['email_address'] = emailAddress
    }
    await emersonApiAgent.post(
      '/iam/end_users/signup_intents',
      {
        ...data,
      },
      {
        onFail: (_status, data) => {
          if (tab === '手機註冊') {
            createSignupIntentForm.setError('nationalPhoneNumber', {
              type: 'custom',
              message: data.message,
            })
          } else if (tab === 'Email註冊') {
            createSignupIntentForm.setError('emailAddress', {
              type: 'custom',
              message: data.message,
            })
          }
        },
        onSuccess: (data) => {
          set_stage(Stage.VERIFY_SIGNUP_INTENT)
        },
      }
    )
  }

  const handleSubmitVerifySignupIntentForm = async (payload) => {
    track('submit-verify-signup-intent-form')
    let data = {}
    if (tab === '手機註冊') {
      data['phone_number'] = normalize_phone_number(
        watchCountryCode,
        watchNationalPhoneNumber
      )
    } else if (tab === 'Email註冊') {
      data['email_address'] = watchEmailAddress
    }
    await emersonApiAgent.post(
      '/iam/end_users/signup_intents/current/verify',
      {
        ...data,
        ...payload,
      },
      {
        onFail: (_status, _data) => {
          verifySignupIntentForm.setError('one_time_password', {
            type: 'custom',
            message: '驗證碼錯誤',
          })
        },
        onSuccess: (data) => {
          set_token(data)
          set_stage(Stage.SIGNUP)
          verifySignupIntentForm.setValue('one_time_password', '')
          setActiveStep(0)
        },
      }
    )
  }

  const handleSubmitSignupForm = async (payload) => {
    track('submit-signup-form')
    let data = {}
    if (tab === '手機註冊') {
      data['phone_number'] = normalize_phone_number(
        watchCountryCode,
        watchNationalPhoneNumber
      )
    } else if (tab === 'Email註冊') {
      data['email_address'] = watchEmailAddress
    }
    await emersonApiAgent.post(
      '/iam/end_users/signup',
      {
        ...payload,
        ...data,
        token,
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: async (data) => {
          await fetchEndUser()
          router.push('/')
        },
      }
    )
  }

  return (
    <AppLayout container={false}>
      <Stack justifyContent="space-between" fluid fill>
        <Stack fluid>
          <Banner src="/images/ĒSEN+logo.svg" width={74} height={30} />
          {stage === Stage.CREATE_SIGNUP_INTENT && (
            <Container fluid>
              <Stack gap="m" fluid>
                <Stack gap="s">
                  <Heading size="m">歡迎來到ĒSEN！</Heading>
                  <Text variant="tertiary" size="xs">
                    {tab === '手機註冊' &&
                      '為了確保您的帳戶安全，請輸入您的個人手機號碼，我們將向您發送授權碼。'}
                    {tab === 'Email註冊' &&
                      '為了確保您的帳戶安全，請輸入您的個人Email地址，我們將向您發送授權碼。'}
                  </Text>
                </Stack>

                <Form
                  fluid
                  onSubmit={createSignupIntentForm.handleSubmit(
                    handleSubmitCreateSignupIntentForm
                  )}
                >
                  <Stack gap="m" fluid>
                    <Tab type="pill" fluid>
                      <Tab.Item
                        active={tab === '手機註冊'}
                        onClick={() => setTab('手機註冊')}
                      >
                        手機註冊
                      </Tab.Item>
                      <Tab.Item
                        active={tab === 'Email註冊'}
                        onClick={() => setTab('Email註冊')}
                      >
                        Email註冊
                      </Tab.Item>
                    </Tab>
                    {tab === '手機註冊' && (
                      <>
                        <Controller
                          control={createSignupIntentForm.control}
                          name="countryCode"
                          render={({ field }) => (
                            <DropdownSelect
                              fluid
                              options={[
                                {
                                  value: '+886',
                                  label: '台灣（+886）',
                                },
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                        <Field fluid>
                          <Input
                            fluid
                            placeholder="輸入您的手機號碼"
                            type="tel"
                            variant={
                              createSignupIntentForm.formState.errors
                                .nationalPhoneNumber
                                ? 'negative'
                                : 'primary'
                            }
                            {...createSignupIntentForm.register(
                              'nationalPhoneNumber',
                              {
                                required: '必填',
                                validate: {
                                  matchFormat: (v) =>
                                    is_phone_number_valid(
                                      watchCountryCode,
                                      v
                                    ) || '手機格式錯誤',
                                },
                              }
                            )}
                          />
                          {createSignupIntentForm.formState.errors
                            .nationalPhoneNumber && (
                            <Text size="xs" variant="negative">
                              {
                                createSignupIntentForm.formState.errors
                                  .nationalPhoneNumber.message
                              }
                            </Text>
                          )}
                        </Field>
                      </>
                    )}
                    {tab === 'Email註冊' && (
                      <Field fluid>
                        <Input
                          fluid
                          placeholder="輸入您的Email地址"
                          type="email"
                          variant={
                            createSignupIntentForm.formState.errors.emailAddress
                              ? 'negative'
                              : 'primary'
                          }
                          {...createSignupIntentForm.register('emailAddress', {
                            required: '必填',
                          })}
                        />
                        {createSignupIntentForm.formState.errors
                          .emailAddress && (
                          <Text size="xs" variant="negative">
                            {
                              createSignupIntentForm.formState.errors
                                .emailAddress.message
                            }
                          </Text>
                        )}
                      </Field>
                    )}
                    <Button
                      fluid
                      inversed
                      variant="primary"
                      type="submit"
                      loading={createSignupIntentForm.formState.isSubmitting}
                      disabled={
                        (tab === '手機註冊' &&
                          !is_phone_number_valid(
                            watchCountryCode,
                            watchNationalPhoneNumber
                          )) ||
                        (tab === 'Email註冊' && !watchEmailAddress)
                      }
                    >
                      寄出驗證碼
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Container>
          )}
          {stage === Stage.VERIFY_SIGNUP_INTENT && (
            <Container fluid>
              <Stack gap="m" fluid>
                <Stack gap="s">
                  <Heading size="m">歡迎來到ĒSEN！</Heading>
                  <Text variant="tertiary">
                    為了確保您的帳戶安全，請輸入您的個人手機號碼，我們將向您發送授權碼。
                  </Text>
                </Stack>
                <Form
                  fluid
                  onSubmit={verifySignupIntentForm.handleSubmit(
                    handleSubmitVerifySignupIntentForm
                  )}
                >
                  <Stack gap="m" fluid>
                    <Field fluid>
                      <Input
                        fluid
                        placeholder="輸入驗證碼"
                        type="text"
                        variant={
                          verifySignupIntentForm.formState.errors
                            .one_time_password
                            ? 'negative'
                            : 'primary'
                        }
                        {...verifySignupIntentForm.register(
                          'one_time_password',
                          {
                            required: '必填',
                          }
                        )}
                      />
                      {verifySignupIntentForm.formState.errors
                        .one_time_password && (
                        <Text size="xs" variant="negative">
                          {
                            verifySignupIntentForm.formState.errors
                              .one_time_password.message
                          }
                        </Text>
                      )}
                    </Field>
                    <Button
                      fluid
                      inversed
                      type="submit"
                      variant="primary"
                      loading={verifySignupIntentForm.formState.isSubmitting}
                      disabled={!is_otp_valid(watch_one_time_password)}
                    >
                      驗證
                    </Button>
                    <Text fluid variant="secondary" size="xs" align="center">
                      {tab === '手機註冊' && '未收到簡訊？'}
                      {tab === 'Email註冊' && '未收到驗證信？'}
                      <Hyperlink
                        disabled={resend_otp_remaining_seconds >= 0}
                        onClick={createSignupIntentForm.handleSubmit(
                          handleSubmitCreateSignupIntentForm
                        )}
                      >
                        再寄一次
                        {resend_otp_remaining_seconds >= 0 &&
                          `（${resend_otp_remaining_seconds}秒）`}
                      </Hyperlink>
                    </Text>
                  </Stack>
                </Form>
              </Stack>
            </Container>
          )}
          {stage === Stage.SIGNUP && (
            <Stack fluid>
              <Container fluid>
                <Stack gap="s" fluid>
                  <Heading size="m">註冊會員</Heading>
                  <Progress
                    type="strip"
                    variant="info"
                    count={STEP_COUNT}
                    now={activeStep}
                  />
                </Stack>
              </Container>
              <Container fluid>
                <Form fluid>
                  {activeStep === 0 && (
                    <Stack gap="xl" fluid>
                      <Field fluid>
                        <Label size="s">姓氏</Label>
                        <Input
                          fluid
                          placeholder="您的姓氏"
                          type="text"
                          {...signupForm.register('last_name')}
                        />
                      </Field>
                      <Field fluid>
                        <Label size="s">名字</Label>
                        <Input
                          fluid
                          placeholder="您的名字"
                          type="text"
                          {...signupForm.register('first_name')}
                        />
                      </Field>
                      <Field fluid>
                        <Label size="s">Email</Label>
                        <Input
                          fluid
                          placeholder="您的Email帳號"
                          type="email"
                          disabled={tab === 'Email註冊'}
                          value={
                            tab === 'Email註冊' ? watchEmailAddress : undefined
                          }
                          {...signupForm.register('email_address')}
                        />
                      </Field>
                      {tab === '手機註冊' && (
                        <Field fluid>
                          <Label size="s">手機號碼</Label>
                          <Input
                            fluid
                            type="text"
                            disabled
                            value={normalize_phone_number(
                              watchCountryCode,
                              watchNationalPhoneNumber
                            )}
                          />
                        </Field>
                      )}
                    </Stack>
                  )}
                  {activeStep === 1 && (
                    <Stack gap="xl" fluid>
                      <Field fluid>
                        <Label size="s">出生日期</Label>
                        <Input
                          fluid
                          type="date"
                          pattern="[0-9]{4}/[0-9]{2}/[0-9]{2}"
                          {...signupForm.register('birth_date')}
                        />
                      </Field>
                      <Field fluid>
                        <Label size="s">生理性別</Label>

                        <Controller
                          control={signupForm.control}
                          name="gender"
                          render={({ field }) => (
                            <DropdownSelect
                              fluid
                              placeholder="選擇您的生理性別"
                              getOptions={(sendOptions) => {
                                sendOptions(
                                  [
                                    GENDER_ENUM.MALE,
                                    GENDER_ENUM.FEMALE,
                                    GENDER_ENUM.NON_BINARY,
                                  ].map((ge) => ({
                                    value: ge,
                                    label: genderMap[ge],
                                  }))
                                )
                              }}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          )}
                        />
                      </Field>
                      <Field fluid>
                        <Label size="s">身分證字號/居留證/護照號碼</Label>
                        <Input
                          fluid
                          type="text"
                          placeholder="您的身分證字號"
                          {...signupForm.register('tw_identity_card_number')}
                        />
                      </Field>
                    </Stack>
                  )}
                </Form>
              </Container>
            </Stack>
          )}
        </Stack>

        {stage === Stage.CREATE_SIGNUP_INTENT && (
          <Footer>
            <Text variant="secondary" size="xs" align="center">
              已經有前來就診過？從這裡
              <Link passHref href="/login">
                <Hyperlink>登入</Hyperlink>
              </Link>
            </Text>
          </Footer>
        )}
        {stage === Stage.SIGNUP && (
          <Footer>
            <Inline justifyContent="space-between">
              <Button
                size="s"
                variant="secondary"
                prefix={<Icon name="arrow_back" />}
                onClick={() => {
                  track('click-previous-step')
                  if (activeStep == 0) {
                    set_stage(Stage.CREATE_SIGNUP_INTENT)
                  } else {
                    setActiveStep(activeStep - 1)
                  }
                }}
              >
                上一步
              </Button>
              <Button
                size="s"
                variant="primary"
                inversed
                suffix={<Icon name="arrow_forward" />}
                loading={signupForm.formState.isSubmitting}
                onClick={() => {
                  if (activeStep < STEP_COUNT - 1) {
                    track('click-next-step')
                    setActiveStep(activeStep + 1)
                  } else if (activeStep === STEP_COUNT - 1) {
                    signupForm.handleSubmit(handleSubmitSignupForm)()
                  }
                }}
              >
                下一步
              </Button>
            </Inline>
          </Footer>
        )}
      </Stack>
    </AppLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default SignupPage
