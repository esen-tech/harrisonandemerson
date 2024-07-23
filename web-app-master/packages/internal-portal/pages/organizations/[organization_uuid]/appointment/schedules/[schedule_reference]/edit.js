import Button from '@esen/essence/components/Button'
import Card from '@esen/essence/components/Card'
import Container from '@esen/essence/components/Container'
import Field from '@esen/essence/components/Field'
import Icon from '@esen/essence/components/Icon'
import Image from '@esen/essence/components/Image'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import { FilterTypes } from '@esen/utils/constants/organization_internal_user'
import { EMPLOYMENT_STATE } from '@esen/utils/constants/state'
import { get_full_name } from '@esen/utils/fn'
import addDays from 'date-fns/addDays'
import addWeeks from 'date-fns/addWeeks'
import differenceInDays from 'date-fns/differenceInDays'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import startOfWeek from 'date-fns/startOfWeek'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import OrganizationAppointmentPageLayout from '../../../../../../components/layout/OrganizationAppointmentPageLayout'
import Page from '../../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../../utils/apiAgent'

const weekdayStrs = ['一', '二', '三', '四', '五', '六', '日']

const StyledTable = styled(Table)`
  table-layout: fixed;
`

const StyledTh = styled(Table.Th)`
  width: 12.5%;
`

const StyledContainer = styled(Container)`
  padding: var(--es-theme-space-padding-l) var(--es-theme-space-padding-m);
  border: 1px solid transparent;
  border-bottom: 1px solid var(--es-theme-border-primary-default);

  ${({ $borderRight }) => {
    if ($borderRight) {
      return `
        border-right: 1px solid var(--es-theme-border-primary-default);
      `
    }
  }}

  ${({ $disabled }) => {
    if ($disabled) {
      return `
        pointer-events: none;
        background: var(--es-theme-bg-primary-hovered);
      `
    }
  }}

  ${({ $interactable }) => {
    if ($interactable) {
      return `
        cursor: pointer;
        &:hover {
          border: 1px solid var(--es-theme-border-primary-selected);
        }
      `
    }
  }}
`

const Stage = {
  ASSIGN_INTERNAL_USER: 'ASSIGN_INTERNAL_USER',
}

const ModalMode = {
  READ: 'READ',
  WRITE: 'WRITE',
}

const AppointmentEditSchedulePage = () => {
  const router = useRouter()
  const { organization_uuid, schedule_reference } = router.query
  const [stage, setStage] = useState(Stage.ASSIGN_INTERNAL_USER)
  const [modalMode, setModalMode] = useState(ModalMode.READ)
  const [weekOffset, setWeekOffset] = useState(0)
  const [currentViewedDates, setCurrentViewedDates] = useState([])
  const updateScheduleForm = useForm()
  const updateScheduleDateScheduleTimeSlotForm = useForm()
  const [organization_internal_users, set_organization_internal_users] =
    useState([])
  const [showAssignInternalUserModal, setShowAssignInternalUserModal] =
    useState(false)
  const [selectedScheduleDateIndex, setSelectedScheduleDateIndex] = useState(0)
  const [selectedScheduleTimeSlotIndex, setSelectedScheduleTimeSlotIndex] =
    useState(0)
  const [schedule, set_schedule] = useState()
  const values = updateScheduleForm.getValues()
  const minDate = parseISO(`${values.min_date}T00:00:00`)
  const maxDate = parseISO(`${values.max_date}T00:00:00`)
  const internalUserMap = organization_internal_users.reduce(
    (m, oiu) => ({ ...m, [oiu.internal_user.reference]: oiu.internal_user }),
    {}
  )

  useEffect(() => {
    async function fetchSchedule() {
      await harrisonApiAgent.get(
        `/scheduling/organizations/${organization_uuid}/schedules/${schedule_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_schedule(data)
          },
        }
      )
    }
    if (schedule_reference) {
      fetchSchedule()
    }
  }, [schedule_reference])

  // restore states of existing schedule
  useEffect(() => {
    if (schedule) {
      const scheduleDateReferenceToIndexMap = schedule.schedule_dates.reduce(
        (m, sd, i) => ({ ...m, [sd.reference]: i }),
        {}
      )
      const scheduleTimeSlotReferenceToIndexMap =
        schedule.schedule_time_slots.reduce(
          (m, sts, i) => ({ ...m, [sts.reference]: i }),
          {}
        )
      updateScheduleForm.reset({
        name: schedule.name,
        min_date: schedule.min_date,
        max_date: schedule.max_date,
        schedule_dates: schedule.schedule_dates,
        schedule_time_slots: schedule.schedule_time_slots.map((sts) => {
          return {
            ...sts,
            start_time: sts.start_time.substring(0, 5),
            end_time: sts.end_time.substring(0, 5),
            _weekdayIndices: sts.weekday_indices
              .split(',')
              .map((s) => parseInt(s)),
          }
        }),
        schedule_date_schedule_time_slots:
          schedule.schedule_date_schedule_time_slots.map((sdsts) => {
            return {
              ...sdsts,
              override_schedule_time_slot_start_time:
                sdsts.override_schedule_time_slot_start_time?.substring(0, 5),
              override_schedule_time_slot_end_time:
                sdsts.override_schedule_time_slot_end_time?.substring(0, 5),
              schedule_date_index:
                scheduleDateReferenceToIndexMap[sdsts.schedule_date_reference],
              schedule_time_slot_index:
                scheduleTimeSlotReferenceToIndexMap[
                  sdsts.schedule_time_slot_reference
                ],
            }
          }),
      })
    }
  }, [schedule])

  useEffect(() => {
    const startDate = addWeeks(
      startOfWeek(minDate, { weekStartsOn: 1 }),
      weekOffset
    )
    const endDate = addWeeks(startDate, 1)
    const dates = []
    let currentDate = startDate
    while (currentDate < endDate) {
      dates.push(currentDate)
      currentDate = addDays(currentDate, 1)
    }
    setCurrentViewedDates(dates)
  }, [weekOffset, values.min_date, values.max_date])

  useEffect(() => {
    async function fetchOrganizationInternalUsers() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization_uuid}/organization_internal_users`,
        {
          params: {
            filter: {
              type: FilterTypes.EMPLOYMENT_STATE.type,
              query: EMPLOYMENT_STATE.EMPLOYED,
            },
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_organization_internal_users(enhanced_data)
          },
        }
      )
    }
    fetchOrganizationInternalUsers()
  }, [])

  const handleHideAssignInternalUserModal = () => {
    setShowAssignInternalUserModal(false)
    updateScheduleDateScheduleTimeSlotForm.reset({ internalUserReferences: [] })
  }

  const handleSubmitUpdateScheduleDateScheduleTimeSlotForm = async (
    payload
  ) => {
    const schedule_date_schedule_time_slot_index =
      values.schedule_date_schedule_time_slots.findIndex(
        (sdsts) =>
          sdsts.schedule_date_index === selectedScheduleDateIndex &&
          sdsts.schedule_time_slot_index === selectedScheduleTimeSlotIndex
      )
    updateScheduleForm.setValue(
      `schedule_date_schedule_time_slots.${schedule_date_schedule_time_slot_index}.override_schedule_time_slot_start_time`,
      payload.override_schedule_time_slot_start_time
    )
    updateScheduleForm.setValue(
      `schedule_date_schedule_time_slots.${schedule_date_schedule_time_slot_index}.override_schedule_time_slot_end_time`,
      payload.override_schedule_time_slot_end_time
    )
    updateScheduleForm.setValue(
      `schedule_date_schedule_time_slots.${schedule_date_schedule_time_slot_index}.schedule_date_schedule_time_slot_internal_users`,
      payload.internalUserReferences.map((r) => ({
        internal_user_reference: r,
      }))
    )
    handleHideAssignInternalUserModal()
  }

  const handleSubmitUpdateScheduleForm = async (payload, shouldPublish) => {
    await harrisonApiAgent.patch(
      `/scheduling/organizations/${organization_uuid}/schedules/${schedule_reference}`,
      {
        schedule_date_schedule_time_slots:
          payload.schedule_date_schedule_time_slots,
      },
      {
        onFail: (_status, data) => {
          alert(data?.message)
        },
        onSuccess: async (data) => {
          if (!shouldPublish) {
            router.push(
              `/organizations/${organization_uuid}/appointment/schedules`
            )
          } else {
            await harrisonApiAgent.post(
              `/scheduling/organizations/${organization_uuid}/schedules/${schedule_reference}/publish`,
              null,
              {
                onFail: (_status, data) => {
                  alert(data?.message)
                },
                onSuccess: async (data) => {
                  router.push(
                    `/organizations/${organization_uuid}/appointment/schedules`
                  )
                },
              }
            )
          }
        },
      }
    )
  }

  return (
    <OrganizationAppointmentPageLayout>
      {stage === Stage.ASSIGN_INTERNAL_USER && (
        <Page>
          <Page.Header
            title={values.name}
            subtitle={
              <Label size="m" variant="tertiary">
                {values.min_date} —— {values.max_date}
              </Label>
            }
            leftControl={
              <Inline gap="m" alignItems="center">
                <Icon
                  name="navigate_before"
                  sizeInPixel={20}
                  pointer
                  disabled={currentViewedDates[0] <= minDate}
                  onClick={() => setWeekOffset((o) => o - 1)}
                />
                <Icon
                  name="navigate_next"
                  sizeInPixel={20}
                  pointer
                  disabled={
                    maxDate <= currentViewedDates[currentViewedDates.length - 1]
                  }
                  onClick={() => setWeekOffset((o) => o + 1)}
                />
              </Inline>
            }
            rightControl={
              <Inline gap="s">
                {!schedule?.last_publish_time && (
                  <Button
                    variant="negative"
                    onClick={() =>
                      router.push(
                        `/organizations/${organization_uuid}/appointment/schedules`
                      )
                    }
                  >
                    取消建立
                  </Button>
                )}
                {!schedule?.last_publish_time && (
                  <Button
                    onClick={updateScheduleForm.handleSubmit((payload) =>
                      handleSubmitUpdateScheduleForm(payload, false)
                    )}
                  >
                    儲存班表
                  </Button>
                )}
                <Button
                  variant="primary"
                  inversed
                  onClick={updateScheduleForm.handleSubmit((payload) =>
                    handleSubmitUpdateScheduleForm(payload, true)
                  )}
                >
                  發佈班表
                </Button>
              </Inline>
            }
          />
          <Page.Section size={false}>
            <StyledTable fluid>
              <thead>
                <Table.Tr>
                  <StyledTh customized>
                    <StyledContainer fill />
                  </StyledTh>
                  {currentViewedDates.map((date, i) => (
                    <StyledTh key={date} customized>
                      <StyledContainer>
                        <Stack gap="xs">
                          <Label
                            size="xs"
                            variant="tertiary"
                            disabled={date < minDate || maxDate < date}
                          >
                            星期{weekdayStrs[i]}
                          </Label>
                          <Label
                            size="m"
                            variant="primary"
                            disabled={date < minDate || maxDate < date}
                          >
                            {format(date, 'MM/dd')}
                          </Label>
                        </Stack>
                      </StyledContainer>
                    </StyledTh>
                  ))}
                </Table.Tr>
              </thead>
              <tbody>
                {values.schedule_time_slots?.map(
                  (schedule_time_slot, tsIndex) => {
                    return (
                      <Table.Tr key={schedule_time_slot.name}>
                        <Table.Th customized>
                          <StyledContainer fill $borderRight>
                            <Label size="xs" variant="tertiary">
                              {schedule_time_slot.name}
                            </Label>
                          </StyledContainer>
                        </Table.Th>
                        {currentViewedDates.map((date, weekdayIndex) => {
                          const isDateDisabled =
                            date < minDate || maxDate < date
                          const isTimeSlotDisabled =
                            !schedule_time_slot._weekdayIndices?.includes(
                              weekdayIndex
                            )
                          const dateIndex = differenceInDays(date, minDate)
                          let schedule_date_schedule_time_slot
                          if (!isDateDisabled && !isTimeSlotDisabled) {
                            schedule_date_schedule_time_slot =
                              values.schedule_date_schedule_time_slots.find(
                                (sdsts) =>
                                  sdsts.schedule_date_index === dateIndex &&
                                  sdsts.schedule_time_slot_index === tsIndex
                              )
                          }
                          return (
                            <Table.Td key={date} customized>
                              <StyledContainer
                                fill
                                $disabled={isDateDisabled}
                                $interactable={
                                  !isDateDisabled && !isTimeSlotDisabled
                                }
                                onClick={() => {
                                  if (isTimeSlotDisabled) {
                                    return
                                  }
                                  setShowAssignInternalUserModal(true)
                                  setSelectedScheduleDateIndex(
                                    differenceInDays(date, minDate)
                                  )
                                  setSelectedScheduleTimeSlotIndex(tsIndex)
                                  updateScheduleDateScheduleTimeSlotForm.reset({
                                    override_schedule_time_slot_start_time:
                                      schedule_date_schedule_time_slot.override_schedule_time_slot_start_time,
                                    override_schedule_time_slot_end_time:
                                      schedule_date_schedule_time_slot.override_schedule_time_slot_end_time,
                                    internalUserReferences:
                                      schedule_date_schedule_time_slot.schedule_date_schedule_time_slot_internal_users.map(
                                        (sdstsiu) =>
                                          sdstsiu.internal_user_reference
                                      ),
                                  })
                                }}
                              >
                                {!isDateDisabled &&
                                  (isTimeSlotDisabled ? (
                                    <Stack gap="m">
                                      <Label
                                        size="m"
                                        variant="secondary"
                                        disabled
                                      >
                                        休診
                                      </Label>
                                      <Inline gap="s" alignItems="center">
                                        <Icon
                                          disabled
                                          name="account_circle"
                                          sizeInPixel={24}
                                        />
                                        <Text
                                          size="xs"
                                          variant="secondary"
                                          disabled
                                        >
                                          無
                                        </Text>
                                      </Inline>
                                    </Stack>
                                  ) : (
                                    <Stack gap="m">
                                      <Label
                                        size="m"
                                        variant="secondary"
                                        pointer
                                      >
                                        {`${
                                          schedule_date_schedule_time_slot?.override_schedule_time_slot_start_time ||
                                          schedule_time_slot.start_time
                                        } - ${
                                          schedule_date_schedule_time_slot?.override_schedule_time_slot_end_time ||
                                          schedule_time_slot.end_time
                                        }`}
                                      </Label>
                                      {schedule_date_schedule_time_slot
                                        ?.schedule_date_schedule_time_slot_internal_users
                                        ?.length > 0 ? (
                                        schedule_date_schedule_time_slot.schedule_date_schedule_time_slot_internal_users.map(
                                          (sdstsiu) => {
                                            const internalUser =
                                              internalUserMap[
                                                sdstsiu.internal_user_reference
                                              ]
                                            if (!internalUser) {
                                              return
                                            }
                                            return (
                                              <Inline
                                                key={internalUser.reference}
                                                gap="s"
                                                alignItems="center"
                                              >
                                                <Image
                                                  width={24}
                                                  height={24}
                                                  rounded
                                                  src={internalUser.avatar_src}
                                                />
                                                <Text
                                                  size="xs"
                                                  variant="secondary"
                                                >
                                                  {get_full_name(internalUser)}
                                                </Text>
                                              </Inline>
                                            )
                                          }
                                        )
                                      ) : (
                                        <Inline gap="s" alignItems="center">
                                          <Icon
                                            disabled
                                            name="account_circle"
                                            sizeInPixel={24}
                                          />
                                          <Text size="xs" variant="secondary">
                                            尚無值班醫師
                                          </Text>
                                        </Inline>
                                      )}
                                    </Stack>
                                  ))}
                              </StyledContainer>
                            </Table.Td>
                          )
                        })}
                      </Table.Tr>
                    )
                  }
                )}
              </tbody>
              <tfoot>
                <Table.Tr>
                  <Table.Td crossRow />
                </Table.Tr>
              </tfoot>
            </StyledTable>
          </Page.Section>
        </Page>
      )}

      <Modal
        show={showAssignInternalUserModal}
        onHide={handleHideAssignInternalUserModal}
        style={{
          minWidth: 600,
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
          {modalMode === ModalMode.READ && (
            <Stack fluid gap="xxl">
              <Inline fluid justifyContent="space-between">
                <Label size="l">開診時段</Label>
                <Icon
                  sizeInPixel={24}
                  name="close"
                  pointer
                  onClick={handleHideAssignInternalUserModal}
                />
              </Inline>
              <Field as={Stack} fluid gap="m">
                <Label size="m" variant="primary">
                  診次時段
                </Label>
                <ListItem
                  verticallyCentered
                  controlScope="control"
                  style={{
                    borderRadius: 'var(--es-border-radius-1)',
                    border: '1px solid var(--es-theme-border-primary-default)',
                  }}
                >
                  <ListItem.Content
                    title={`${
                      updateScheduleDateScheduleTimeSlotForm.getValues()
                        ?.override_schedule_time_slot_start_time ||
                      values.schedule_time_slots?.[
                        selectedScheduleTimeSlotIndex
                      ].start_time
                    } - ${
                      updateScheduleDateScheduleTimeSlotForm.getValues()
                        ?.override_schedule_time_slot_end_time ||
                      values.schedule_time_slots?.[
                        selectedScheduleTimeSlotIndex
                      ].end_time
                    }`}
                    paragraph={`${values.schedule_dates?.[selectedScheduleDateIndex].date}`}
                  />
                  <ListItem.Control
                    badgeComponent={
                      <Label size="s" variant="info">
                        編輯
                      </Label>
                    }
                    icon={{ name: 'arrow_forward_ios' }}
                    onClick={() => setModalMode(ModalMode.WRITE)}
                  />
                </ListItem>
              </Field>
              <Field as={Stack} fluid gap="m">
                <Label size="m" variant="primary">
                  值班人員
                </Label>
                <Controller
                  control={updateScheduleDateScheduleTimeSlotForm.control}
                  name="internalUserReferences"
                  render={({ field }) => (
                    <Inline fluid gap="s">
                      {organization_internal_users.map((oiu) => {
                        const isActive = field.value?.includes(
                          oiu.internal_user.reference
                        )
                        return (
                          <Card
                            key={oiu.reference}
                            centered
                            inset
                            controlScope="all"
                            active={isActive}
                            onClick={() => {
                              if (isActive) {
                                field.onChange([])
                              } else {
                                field.onChange([oiu.internal_user.reference])
                              }
                            }}
                          >
                            <Card.Media
                              image={{
                                fluid: false,
                                width: 64,
                                height: 64,
                                rounded: true,
                                src: oiu.internal_user.avatar_src,
                              }}
                            />
                            <Card.Content
                              title={get_full_name(oiu.internal_user)}
                              paragraph="醫師"
                            />
                          </Card>
                        )
                      })}
                    </Inline>
                  )}
                />
              </Field>
              <Inline fluid gap="s" justifyContent="end">
                <Button onClick={handleHideAssignInternalUserModal}>
                  取消
                </Button>
                <Button
                  inversed
                  variant="primary"
                  onClick={updateScheduleDateScheduleTimeSlotForm.handleSubmit(
                    handleSubmitUpdateScheduleDateScheduleTimeSlotForm
                  )}
                >
                  確定
                </Button>
              </Inline>
            </Stack>
          )}
          {modalMode === ModalMode.WRITE && (
            <Stack fluid gap="xxl">
              <Inline gap="m" alignItems="center">
                <Icon
                  name="arrow_back"
                  sizeInPixel={24}
                  pointer
                  onClick={() => {
                    setModalMode(ModalMode.READ)
                    updateScheduleDateScheduleTimeSlotForm.setValue(
                      'override_schedule_time_slot_start_time',
                      null
                    )
                    updateScheduleDateScheduleTimeSlotForm.setValue(
                      'override_schedule_time_slot_end_time',
                      null
                    )
                  }}
                />
                <Label size="l">編輯時段</Label>
              </Inline>
              <Inline gap="l" fluid>
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    開診時間
                  </Label>
                  <Input
                    fluid
                    placeholder="填入開診時間"
                    type="time"
                    {...updateScheduleDateScheduleTimeSlotForm.register(
                      'override_schedule_time_slot_start_time'
                    )}
                  />
                </Field>
                <Field as={Stack} fluid>
                  <Label size="s" variant="secondary">
                    關診時間
                  </Label>
                  <Input
                    fluid
                    placeholder="填入關診時間"
                    type="time"
                    {...updateScheduleDateScheduleTimeSlotForm.register(
                      'override_schedule_time_slot_end_time'
                    )}
                  />
                </Field>
              </Inline>
              <Inline fluid gap="s" justifyContent="end">
                <Button onClick={handleHideAssignInternalUserModal}>
                  取消
                </Button>
                <Button
                  inversed
                  variant="primary"
                  onClick={() => setModalMode(ModalMode.READ)}
                >
                  確定編輯
                </Button>
              </Inline>
            </Stack>
          )}
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

export default AppointmentEditSchedulePage
