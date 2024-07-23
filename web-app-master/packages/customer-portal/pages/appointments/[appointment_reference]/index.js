import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import { get_full_name, get_local_datetime } from '@esen/utils/fn'
import { useInternalUserCollection } from '@esen/utils/hooks/useInternalUserCollection'
import { useOrganizationCollection } from '@esen/utils/hooks/useOrganizationCollection'
import { useServiceProductCollection } from '@esen/utils/hooks/useServiceProductCollection'
import useTrack from '@esen/utils/hooks/useTrack'
import addHours from 'date-fns/addHours'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import AppointmentBadge from '../../../components/badge/AppointmentBadge'
import CancelAppointmentOffcanvas from '../../../components/CancelAppointmentOffcanvas'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import ModalNavbar from '../../../components/navigation/ModalNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const ActionEnum = {
  EDIT: 'edit',
  EXIT: 'exit',
}

const StyledIcon = styled(Icon)`
  padding: var(--es-theme-space-padding-m) 0 var(--es-theme-space-padding-m)
    var(--es-theme-space-padding-m);
`

const StyledContainer = styled(Container)`
  position: sticky;
  bottom: 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.05);
`

const AppointmentRetrievePage = () => {
  const router = useRouter()
  const [track] = useTrack()
  const [appointment, set_appointment] = useState()
  const organizationCollection = useOrganizationCollection()
  const internalUserCollection = useInternalUserCollection()
  const serviceProductCollection = useServiceProductCollection()
  const [showCancelAppointmentOffcanvas, setShowCancelAppointmentOffcanvas] =
    useState(false)
  const { action, appointment_reference } = router.query

  const fetchAppointment = async (appointmentReference) => {
    await emersonApiAgent.get(
      `/scheduling/end_users/me/appointments/${appointmentReference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_appointment(data)
        },
      }
    )
  }

  useEffect(() => {
    if (appointment_reference === undefined) {
      return
    }
    fetchAppointment(appointment_reference)
  }, [appointment_reference])

  useEffect(() => {
    if (appointment) {
      internalUserCollection.addReference(
        appointment.internal_user_appointment_time_slots[0]
          .internal_user_reference
      )
      organizationCollection.addReference(appointment.organization_reference)
      serviceProductCollection.addReference(
        appointment.service_product_reference
      )
    }
  }, [appointment])

  const handleDismiss = () => {
    router.replace(router.query.referrer)
  }

  const handleCancelAppointmentButtonClick = async () => {
    track('submit-cancel-appointment-form')
    await emersonApiAgent.post(
      `/scheduling/end_users/me/appointments/${appointment_reference}/cancel`,
      null,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: async (_data) => {
          fetchAppointment(appointment_reference)
          router.push({
            query: {
              ...router.query,
              action: null,
            },
          })
          setShowCancelAppointmentOffcanvas(false)
        },
      }
    )
  }

  const organization =
    organizationCollection.map?.[appointment?.organization_reference]
  const internalUser =
    internalUserCollection.map?.[
      appointment?.internal_user_appointment_time_slots?.[0]
        ?.internal_user_reference
    ]
  const serviceProduct =
    serviceProductCollection.map?.[appointment?.service_product_reference]

  return (
    <AuthPageLayout
      navbar={<ModalNavbar title="預約資訊" onDismiss={handleDismiss} />}
    >
      <Stack fluid grow={1} justifyContent="space-between">
        <Stack fluid gap="s">
          <Container fluid>
            <Spacer ySize="l" />
            <Stack gap="m">
              <Heading size="m">
                {serviceProduct?.display_sku_key || '(未知服務)'}
              </Heading>
              <Inline gap="s" alignItems="center">
                <AppointmentBadge state={appointment?.state} />
                {serviceProduct?.registration_fee_amount && (
                  <Inline gap="xs">
                    <Label size="xs" variant="tertiary">
                      費用
                    </Label>
                    <Label size="xs" variant="tertiary">
                      {serviceProduct.registration_fee_amount}
                    </Label>
                  </Inline>
                )}
              </Inline>
              <Text size="xs" variant="tertiary">
                {serviceProduct?.display_description_key}
              </Text>
            </Stack>
          </Container>

          <Container fluid size={false}>
            <Spacer ySize="l" />
            {appointment?.principal_name && (
              <Inline>
                <StyledIcon name="group" sizeInPixel={24} />
                <ListItem>
                  <ListItem.Content
                    title={appointment.principal_name}
                    paragraph="就診人"
                  />
                </ListItem>
              </Inline>
            )}
            {organization && (
              <Inline>
                <StyledIcon name="meeting_room" sizeInPixel={24} />
                <ListItem>
                  <ListItem.Content
                    title={organization.display_key}
                    paragraph={organization.correspondence_address}
                  />
                </ListItem>
              </Inline>
            )}
            <Inline>
              <StyledIcon name="person" sizeInPixel={24} />
              <ListItem>
                <ListItem.Content
                  title={get_full_name(internalUser)}
                  paragraph="醫師"
                />
                <ListItem.Media
                  image={{
                    src: internalUser?.avatar_src,
                    width: 40,
                    height: 40,
                    rounded: true,
                  }}
                />
              </ListItem>
            </Inline>
            <Inline>
              <StyledIcon name="access_time" fill={false} sizeInPixel={24} />
              <ListItem>
                <ListItem.Content
                  title={
                    appointment?.evaluated_time_slot?.start_time
                      ? get_local_datetime(
                          appointment.evaluated_time_slot.start_time,
                          'yyyy-MM-dd'
                        )
                      : 'N/A'
                  }
                  paragraph={`${
                    appointment?.evaluated_time_slot?.start_time
                      ? get_local_datetime(
                          appointment.evaluated_time_slot.start_time,
                          'HH:mm'
                        )
                      : 'N/A'
                  } - ${
                    appointment?.evaluated_time_slot?.end_time
                      ? get_local_datetime(
                          appointment?.evaluated_time_slot?.end_time,
                          'HH:mm'
                        )
                      : 'N/A'
                  } (${
                    serviceProduct?.duration_in_time_slots * 5 || 'N/A'
                  } mins)`}
                />
              </ListItem>
            </Inline>
            <Spacer ySize="l" />
          </Container>

          <Container fluid>
            <Stack gap="m">
              <Heading size="s">注意事項</Heading>
              <Text size="s" variant="secondary" multiLine>
                {serviceProduct?.display_note}
              </Text>
            </Stack>
          </Container>

          {/* {appointment?.state === APPOINTMENT_STATE.COMPLETED &&
            appointment?.visit && (
              <Container fluid>
                <Link
                  replace
                  href={{
                    pathname: `/visits/${appointment.visit.uuid}`,
                    query: { referrer: router.query.referrer },
                  }}
                >
                  <Button>查看就診紀錄</Button>
                </Link>
              </Container>
            )} */}

          {action === ActionEnum.EXIT && (
            <Container fluid>
              <Spacer ySize="s" />
              <Button
                type="button"
                inversed
                variant="primary"
                fluid
                onClick={handleDismiss}
              >
                結束
              </Button>
              <Spacer ySize="s" />
            </Container>
          )}
        </Stack>

        {action === ActionEnum.EDIT && (
          <StyledContainer fluid>
            <Inline fluid gap="s">
              <Button
                fluid
                disabled={
                  addHours(new Date(), 24) >
                  new Date(
                    get_local_datetime(
                      appointment?.evaluated_time_slot?.start_time,
                      'yyyy-MM-dd HH:mm:ss'
                    )
                  )
                }
                variant="negative"
                onClick={() => {
                  track('show-cancel-appointment-offcanvas')
                  setShowCancelAppointmentOffcanvas(true)
                }}
              >
                取消預約
              </Button>
              <Button
                fluid
                variant="primary"
                inversed
                disabled={
                  addHours(new Date(), 24) >
                  new Date(
                    get_local_datetime(
                      appointment?.evaluated_time_slot?.start_time,
                      'yyyy-MM-dd HH:mm:ss'
                    )
                  )
                }
                onClick={() => {
                  router.replace({
                    pathname: `/appointments/${appointment_reference}/edit`,
                    query: {
                      referrer: router.query.referrer,
                    },
                  })
                }}
              >
                修改預約
              </Button>
            </Inline>
            <Spacer ySize="l" />
          </StyledContainer>
        )}
      </Stack>

      <CancelAppointmentOffcanvas
        show={showCancelAppointmentOffcanvas}
        onHide={() => setShowCancelAppointmentOffcanvas(false)}
        onCancelAppointmentButtonClick={handleCancelAppointmentButtonClick}
      />
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AppointmentRetrievePage
