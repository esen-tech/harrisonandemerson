import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'
import { usePaginator } from '@esen/utils/hooks'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { useInfiniteScroll } from '@esen/utils/hooks/useInfiniteScroll'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AppointmentSummary from '../../components/appointment/AppointmentSummary'
import AuthPageLayout from '../../components/layout/AuthPageLayout'
import Navbar from '../../components/navigation/Navbar'
import Placeholder from '../../components/Placeholder'
import { emersonApiAgent } from '../../utils/apiAgent'

export const FilterTypes = {
  CONTAIN_ANY_STATES: {
    type: 'CONTAIN_ANY_STATES',
  },
}

const StyledContainer = styled(Container)`
  position: sticky;
  bottom: 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.05);
`

const AppointmentIndexPage = () => {
  const router = useRouter()
  const paginator = usePaginator()
  const { endUser } = useEndUser()
  const { tab, setTab } = useRouterTab('預約診次')
  const [filterParams, setFilterParams] = useState()
  const [appointments, set_appointments] = useState([])
  const { targetRef } = useInfiniteScroll(() => {
    const isNextDisabled = paginator.isNextDisabled(
      (defaultIsNextDisabled, _previousPages) => {
        const isLastPage =
          appointments.length === paginator.activePage?.count_all_page
        return defaultIsNextDisabled || isLastPage
      }
    )
    if (!isNextDisabled) {
      paginator.goNext()
    }
  })

  useEffect(() => {
    paginator.reset()
    set_appointments([])
    if (tab === '預約診次') {
      setFilterParams({
        type: FilterTypes.CONTAIN_ANY_STATES.type,
        query: [APPOINTMENT_STATE.SCHEDULED],
      })
    } else if (tab === '過去預約紀錄') {
      setFilterParams({
        type: FilterTypes.CONTAIN_ANY_STATES.type,
        query: [
          APPOINTMENT_STATE.COMPLETED,
          APPOINTMENT_STATE.CANCELLED,
          APPOINTMENT_STATE.ABSENT,
        ],
      })
    }
  }, [tab])

  useEffect(() => {
    async function fetch_appointments() {
      await emersonApiAgent.get('/scheduling/end_users/me/appointments', {
        params: { filter: filterParams, page_token: paginator.activePageToken },
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: ({ enhanced_data, metadata: { page } }) => {
          set_appointments([...appointments, ...enhanced_data])
          paginator.setActivePage(page)
        },
      })
    }
    if (endUser && filterParams) {
      fetch_appointments()
    }
  }, [endUser, filterParams, paginator.activePageToken])

  return (
    <AuthPageLayout navbar={<Navbar />}>
      <Stack grow={1} gap="s">
        <Container fluid style={{ paddingBottom: 0 }}>
          <Spacer ySize="l" />
          <Stack gap="m">
            <Heading>預約紀錄</Heading>
            <Tab>
              <Tab.Item
                active={tab === '預約診次'}
                onClick={() => setTab('預約診次')}
              >
                預約診次
              </Tab.Item>
              <Tab.Item
                active={tab === '過去預約紀錄'}
                onClick={() => setTab('過去預約紀錄')}
              >
                過去預約紀錄
              </Tab.Item>
            </Tab>
          </Stack>
        </Container>
        <Container fluid style={{ flexGrow: 1 }}>
          {appointments.length === 0 ? (
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
          ) : (
            appointments.map((appointment) => (
              <AppointmentSummary
                key={appointment.reference}
                className="mb-3"
                appointment={appointment}
                onClick={() => {
                  router.push({
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
            ))
          )}
        </Container>
        <div ref={targetRef} />
      </Stack>
      {appointments.length > 0 && (
        <StyledContainer fluid>
          <Link
            replace
            href={{
              pathname: '/appointments/create',
              query: {
                referrer: router.asPath,
              },
            }}
          >
            <Button fluid inversed variant="primary" size="s">
              預約診次
            </Button>
          </Link>
        </StyledContainer>
      )}
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AppointmentIndexPage
