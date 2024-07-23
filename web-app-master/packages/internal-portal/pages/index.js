import Anchor from '@esen/components/Anchor'
import Center from '@esen/components/layout/Center'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import { useForm } from 'react-hook-form'
import AppLayout from '../components/layout/AppLayout'
import { harrisonApiAgent } from '../utils/apiAgent'

const LoginPage = () => {
  const router = useRouter()
  const { t } = useTranslation('common')
  const { register, handleSubmit } = useForm()
  const { fetchInternalUser, internalUser } = useInternalUser()

  useEffect(() => {
    if (internalUser) {
      router.push('/organizations')
    }
  }, [internalUser])

  const handleSubmitForm = async (payload) => {
    await harrisonApiAgent.post(
      '/iam/internal_users/login',
      {
        email_address: payload.emailAddress,
        password: payload.password,
      },
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          fetchInternalUser()
          router.push('/organizations')
        },
      }
    )
  }

  return (
    <AppLayout>
      <Center>
        <div className="text-center">
          <Image alt="" src="/logo.png" width="72" height="72" />
          <h5>{t('page.login.title')}</h5>
        </div>
        <br />
        <Form>
          <Row className="mb-1">
            <Form.Group as={Col}>
              <Form.Control
                placeholder="你的工作信箱"
                {...register('emailAddress', { required: true })}
                type="email"
              />
            </Form.Group>
          </Row>
          <Row className="mb-1">
            <Form.Group as={Col}>
              <Form.Control
                placeholder="密碼"
                {...register('password', { required: true })}
                type="password"
              />
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="d-grid gap-2">
              <Button variant="dark" onClick={handleSubmit(handleSubmitForm)}>
                登入
              </Button>
            </Form.Group>
          </Row>
        </Form>
        <Row className="mt-4">
          <Col className="text-center">
            <Anchor target="_blank" href="https://forms.gle/phMoQge4HBLnhfGx5">
              註冊會員
            </Anchor>
          </Col>
        </Row>
      </Center>
    </AppLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default LoginPage
