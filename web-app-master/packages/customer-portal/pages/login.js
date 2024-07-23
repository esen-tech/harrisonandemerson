import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Heading from '@esen/essence/components/Heading'
import Hyperlink from '@esen/essence/components/Hyperlink'
import Input from '@esen/essence/components/Input'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import { normalize_phone_number } from '@esen/utils/functions/form'
import { useCountdown } from '@esen/utils/hooks'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import useTrack from '@esen/utils/hooks/useTrack'
import { useTranslation } from 'next-i18next'
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
  CREATE_LOGIN_INTENT: 'CREATE_LOGIN_INTENT',
  LOGIN: 'LOGIN',
}

const LoginPage = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const [track] = useTrack()
  const [tab, setTab] = useState('手機登入')
  const [stage, set_stage] = useState(Stage.CREATE_LOGIN_INTENT)
  const [resend_otp_remaining_seconds, reset_resend_otp_countdown] =
    useCountdown(300)
  const createLoginIntentForm = useForm({
    mode: 'onBlur',
    defaultValues: { countryCode: '+886' },
  })
  const loginForm = useForm()
  const { fetchEndUser, endUser } = useEndUser()

  const watchCountryCode = createLoginIntentForm.watch('countryCode')
  const watchNationalPhoneNumber = createLoginIntentForm.watch(
    'nationalPhoneNumber'
  )
  const watchEmailAddress = createLoginIntentForm.watch('emailAddress')
  const watch_one_time_password = loginForm.watch('one_time_password')

  const handleSubmitCreateLoginIntentForm = async (payload) => {
    const { countryCode, nationalPhoneNumber, emailAddress } = payload

    track('submit-create-login-intent-form')
    reset_resend_otp_countdown()
    let data = {}
    if (tab === '手機登入') {
      data['phone_number'] = normalize_phone_number(
        countryCode,
        nationalPhoneNumber
      )
    } else if (tab === 'Email登入') {
      data['email_address'] = emailAddress
    }
    await emersonApiAgent.post(
      '/iam/end_users/login_intents',
      {
        ...data,
      },
      {
        onFail: (_status, _data) => {
          if (tab === '手機登入') {
            createLoginIntentForm.setError('nationalPhoneNumber', {
              type: 'custom',
              message: '無法寄送驗證碼',
            })
          } else if (tab === 'Email登入') {
            createLoginIntentForm.setError('emailAddress', {
              type: 'custom',
              message: '無法寄送驗證碼',
            })
          }
        },
        onSuccess: (data) => {
          set_stage(Stage.LOGIN)
        },
      }
    )
  }

  const handleSubmitLoginForm = async (payload) => {
    track('submit-login-form')
    let data = {}
    if (tab === '手機登入') {
      data['phone_number'] = normalize_phone_number(
        watchCountryCode,
        watchNationalPhoneNumber
      )
    } else if (tab === 'Email登入') {
      data['email_address'] = watchEmailAddress
    }
    await emersonApiAgent.post(
      '/iam/end_users/login',
      {
        ...data,
        ...payload,
      },
      {
        onFail: (_status, _data) => {
          loginForm.setError('one_time_password', {
            type: 'custom',
            message: '驗證碼錯誤',
          })
        },
        onSuccess: async (_data) => {
          await fetchEndUser()
          router.replace({
            pathname: '/',
            query: router.query,
          })
        },
      }
    )
  }

  return (
    <AppLayout>
      <Stack justifyContent="space-between" fluid fill>
        <Stack fluid>
          <Banner src="/images/ĒSEN+logo.svg" width={74} height={30} />
          {stage === Stage.CREATE_LOGIN_INTENT && (
            <Container fluid>
              <Stack gap="m" fluid>
                <Stack gap="s">
                  <Heading size="m">登入ĒSEN！</Heading>
                  <Text variant="tertiary" size="xs">
                    {tab === '手機登入' &&
                      '如果您曾前來伊生診所就診過，請輸入您當時填寫在初診單的手機號碼即可登入！'}
                    {tab === 'Email登入' &&
                      '如果您曾前來伊生診所就診過，請輸入您當時填寫在初診單的Email即可登入！'}
                  </Text>
                </Stack>

                <Form
                  fluid
                  onSubmit={createLoginIntentForm.handleSubmit(
                    handleSubmitCreateLoginIntentForm
                  )}
                >
                  <Stack gap="m" fluid>
                    <Tab type="pill" fluid>
                      <Tab.Item
                        active={tab === '手機登入'}
                        onClick={() => setTab('手機登入')}
                      >
                        手機登入
                      </Tab.Item>
                      <Tab.Item
                        active={tab === 'Email登入'}
                        onClick={() => setTab('Email登入')}
                      >
                        Email登入
                      </Tab.Item>
                    </Tab>
                    {tab === '手機登入' && (
                      <>
                        <Controller
                          control={createLoginIntentForm.control}
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
                              createLoginIntentForm.formState.errors
                                .nationalPhoneNumber
                                ? 'negative'
                                : 'primary'
                            }
                            {...createLoginIntentForm.register(
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
                          {createLoginIntentForm.formState.errors
                            .nationalPhoneNumber && (
                            <Text size="xs" variant="negative">
                              {
                                createLoginIntentForm.formState.errors
                                  .nationalPhoneNumber.message
                              }
                            </Text>
                          )}
                        </Field>
                      </>
                    )}
                    {tab === 'Email登入' && (
                      <Field fluid>
                        <Input
                          fluid
                          placeholder="輸入您的Email地址"
                          type="email"
                          variant={
                            createLoginIntentForm.formState.errors.emailAddress
                              ? 'negative'
                              : 'primary'
                          }
                          {...createLoginIntentForm.register('emailAddress', {
                            required: '必填',
                          })}
                        />
                        {createLoginIntentForm.formState.errors
                          .emailAddress && (
                          <Text size="xs" variant="negative">
                            {
                              createLoginIntentForm.formState.errors
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
                      loading={createLoginIntentForm.formState.isSubmitting}
                      disabled={
                        (tab === '手機登入' &&
                          !is_phone_number_valid(
                            watchCountryCode,
                            watchNationalPhoneNumber
                          )) ||
                        (tab === 'Email登入' && !watchEmailAddress)
                      }
                    >
                      寄出驗證碼
                    </Button>
                  </Stack>
                </Form>
              </Stack>
            </Container>
          )}
          {stage === Stage.LOGIN && (
            <Container fluid>
              <Stack gap="m" fluid>
                <Stack gap="s">
                  <Heading size="m">登入ĒSEN！</Heading>
                  <Text variant="tertiary">
                    如果您曾前來伊生診所就診過，請輸入您當時填寫在初診單的手機號碼即可登入！
                  </Text>
                </Stack>

                <Form
                  fluid
                  onSubmit={loginForm.handleSubmit(handleSubmitLoginForm)}
                >
                  <Stack gap="m" fluid>
                    <Field fluid>
                      <Input
                        fluid
                        placeholder="輸入驗證碼"
                        type="text"
                        variant={
                          loginForm.formState.errors.one_time_password
                            ? 'negative'
                            : 'primary'
                        }
                        {...loginForm.register('one_time_password', {
                          required: '必填',
                        })}
                      />
                      {loginForm.formState.errors.one_time_password && (
                        <Text size="xs" variant="negative">
                          {loginForm.formState.errors.one_time_password.message}
                        </Text>
                      )}
                    </Field>
                    <Button
                      fluid
                      inversed
                      variant="primary"
                      type="submit"
                      loading={loginForm.formState.isSubmitting}
                      disabled={!is_otp_valid(watch_one_time_password)}
                    >
                      驗證
                    </Button>
                    <Text fluid variant="secondary" size="xs" align="center">
                      未收到簡訊？
                      <Hyperlink
                        disabled={resend_otp_remaining_seconds >= 0}
                        onClick={createLoginIntentForm.handleSubmit(
                          handleSubmitCreateLoginIntentForm
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
        </Stack>
        {stage === Stage.CREATE_LOGIN_INTENT && (
          <Footer>
            <Text variant="secondary" size="xs" align="center">
              以前不曾來就診過？從這裡
              <Link passHref href="/signup">
                <Hyperlink>註冊</Hyperlink>
              </Link>
            </Text>
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

export default LoginPage
