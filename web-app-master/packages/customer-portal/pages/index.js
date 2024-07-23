import Button from '@esen/essence/components/Button'
import Card from '@esen/essence/components/Card'
import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Hyperlink from '@esen/essence/components/Hyperlink'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AppointmentSummary from '../components/appointment/AppointmentSummary'
import Logo from '../components/brand/Logo'
import AuthPageLayout from '../components/layout/AuthPageLayout'
import Navbar from '../components/navigation/Navbar'
import Placeholder from '../components/Placeholder'
import { emersonApiAgent } from '../utils/apiAgent'
import { ESEN_CLINIC_ORGANIZATION_UUID } from '../utils/constants'
import { FilterTypes } from './appointments/index'

const FeedPage = () => {
  const router = useRouter()
  const { endUser } = useEndUser()
  const [appointments, set_appointments] = useState([])
  const [intake_form, set_intake_form] = useState()
  const [organization, set_organization] = useState()

  useEffect(() => {
    const { pathname, query } = router
    if (query.next) {
      const next = query.next
      router.replace(pathname, query)
      router.push(next)
    }
  }, [router.query.next])

  useEffect(() => {
    async function fetch_appointments() {
      await emersonApiAgent.get('/scheduling/end_users/me/appointments', {
        params: {
          filter: {
            type: FilterTypes.CONTAIN_ANY_STATES.type,
            query: [APPOINTMENT_STATE.SCHEDULED],
          },
        },
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: ({ enhanced_data, metadata: { page } }) => {
          set_appointments(enhanced_data)
        },
      })
    }
    async function fetch_intake_form() {
      await emersonApiAgent.get('/emr/end_users/me/intake_form', {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_intake_form(data)
        },
      })
    }
    async function fetch_esen_clinic_organization() {
      await emersonApiAgent.get(
        `/iam/organizations/${ESEN_CLINIC_ORGANIZATION_UUID}`,
        {
          onSuccess: (data) => {
            set_organization(data)
          },
        }
      )
    }
    if (endUser) {
      fetch_appointments()
      fetch_intake_form()
      fetch_esen_clinic_organization()
    }
  }, [endUser])

  return (
    <AuthPageLayout navbar={<Navbar />}>
      <Stack gap="s">
        <Container fluid size={false}>
          <Container
            fluid
            squished
            size="l"
            style={{ paddingTop: 'var(--es-theme-space-padding-xl)' }}
          >
            <Stack gap="xs">
              <Heading>哈囉👋 {endUser?.first_name}</Heading>
              <Text size="s" variant="tertiary">
                你今天需要哪些服務呢？
              </Text>
            </Stack>
          </Container>
          <Stack>
            <Link
              href={{
                pathname: '/appointments/create',
                query: { referrer: '/' },
              }}
            >
              <ListItem verticallyCentered controlScope="all">
                <ListItem.Media
                  image={{
                    width: 32,
                    height: 32,
                    src: '/images/feed/CalendarBlank.png',
                  }}
                />
                <ListItem.Content title="門診預約" />
                <ListItem.Control icon />
              </ListItem>
            </Link>
            <Link href="/appointments">
              <ListItem verticallyCentered controlScope="all">
                <ListItem.Media
                  image={{
                    width: 32,
                    height: 32,
                    src: '/images/feed/Notebook.png',
                  }}
                />
                <ListItem.Content title="診次紀錄" />
                <ListItem.Control icon />
              </ListItem>
            </Link>
            <Link href="/examination-reports">
              <ListItem verticallyCentered controlScope="all">
                <ListItem.Media
                  image={{
                    width: 32,
                    height: 32,
                    src: '/images/feed/Folder.png',
                  }}
                />
                <ListItem.Content title="檢驗報告" />
                <ListItem.Control icon />
              </ListItem>
            </Link>
          </Stack>
        </Container>

        {intake_form !== undefined && !intake_form?.is_finished && (
          <Container fluid variant="secondary">
            <Stack gap="l">
              <Logo />
              <Stack gap="s">
                <Label size="l">提醒您，您尚未填寫初診單</Label>
                <Text size="s" variant="secondary">
                  為了提升您的就診體驗以及效率，我們鼓勵您點此連結，在就診前完成這份初診單！
                </Text>
              </Stack>
              <a href={intake_form?.url} target="_blank">
                <Button inversed variant="primary" size="s">
                  填寫初診單
                </Button>
              </a>
            </Stack>
          </Container>
        )}

        <Container fluid size={false}>
          <Container squished size="l">
            <Inline justifyContent="space-between" alignItems="center">
              <Heading size="s">最新預約</Heading>
              <Label size="xs">
                <Link href="/appointments" passHref>
                  <Hyperlink>查看所有</Hyperlink>
                </Link>
              </Label>
            </Inline>
          </Container>

          {appointments.length === 0 ? (
            <Container>
              <Placeholder
                title="您目前尚無任何預約診次"
                description={'您的健康之路，由ĒSEN照顧！\n現在就前往預約'}
                action={{
                  children: '前往預約',
                  onClick: () =>
                    router.replace({
                      pathname: '/appointments/create',
                      query: {
                        referrer: router.asPath,
                      },
                    }),
                }}
              />
            </Container>
          ) : (
            <Stack>
              {appointments.map((appointment) => (
                <AppointmentSummary
                  key={appointment.reference}
                  appointment={appointment}
                  onClick={() => {
                    router.replace({
                      pathname: `/appointments/${appointment.reference}`,
                      query: {
                        referrer: router.asPath,
                        action:
                          appointment.state === APPOINTMENT_STATE.SCHEDULED
                            ? 'edit'
                            : undefined,
                      },
                    })
                  }}
                />
              ))}
            </Stack>
          )}
        </Container>

        {organization && (
          <Container fluid size={false}>
            <Container squished size="l">
              <Heading size="s">診所資訊</Heading>
            </Container>
            <Link
              replace
              href={{
                pathname: `/organizations/${organization.reference}`,
                query: { referrer: '/' },
              }}
            >
              <Card controlScope="all">
                <Card.Media image={{ src: organization.banner_src }} />
                <Card.Content
                  title={`${organization.display_key}（${organization.branch_key}）`}
                  paragraph={organization.correspondence_address}
                />
              </Card>
            </Link>
          </Container>
        )}
      </Stack>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default FeedPage
