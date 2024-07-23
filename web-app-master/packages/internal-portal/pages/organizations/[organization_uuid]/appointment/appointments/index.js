import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Card from '@esen/essence/components/Card'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Image from '@esen/essence/components/Image'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Modal from '@esen/essence/components/Modal'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Table from '@esen/essence/components/Table'
import Text from '@esen/essence/components/Text'
import MonthlyCalendar from '@esen/utils/components/MonthlyCalendar'
import TimeIntervalCalendar from '@esen/utils/components/TimeIntervalCalendar'
import { FilterTypes as AppointmentFilterTypes } from '@esen/utils/constants/appointment'
import { FilterTypes as EndUserFilterTypes } from '@esen/utils/constants/end_user'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'
import {
  get_full_name,
  get_local_datetime,
  get_organization_name,
  local_to_utc,
} from '@esen/utils/fn'
import {
  getFilteredTimeSlots,
  getQuantizedTimeSlots,
} from '@esen/utils/functions/appointment'
import { normalize_phone_number } from '@esen/utils/functions/form'
import { usePaginator } from '@esen/utils/hooks'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useEndUserCollection } from '@esen/utils/hooks/useEndUserCollection'
import { useInternalUserCollection } from '@esen/utils/hooks/useInternalUserCollection'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { useServiceProductCollection } from '@esen/utils/hooks/useServiceProductCollection'
import addDays from 'date-fns/addDays'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import startOfDay from 'date-fns/startOfDay'
import subMinutes from 'date-fns/subMinutes'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import styled from 'styled-components'
import { v4 as uuidv4 } from 'uuid'
import OrganizationAppointmentPageLayout from '../../../../../components/layout/OrganizationAppointmentPageLayout'
import Page from '../../../../../components/Page'
import { harrisonApiAgent } from '../../../../../utils/apiAgent'

const UpsertAppointmentStage = {
  SELECT_END_USER_TYPE: 'SELECT_END_USER_TYPE',
  CREATE_NEW_END_USER: 'CREATE_NEW_END_USER',
  SELECT_EXISTING_END_USER: 'SELECT_EXISTING_END_USER',
  SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT:
    'SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT',
  SELECT_START_TIME: 'SELECT_START_TIME',
}

const UpsertMode = {
  CREATE: 'CREATE',
  UPDATE: 'UPDATE',
}

const StyledTable = styled(Table)`
  table-layout: fixed;
`

const StyledTh = styled(Table.Th)`
  width: 20%;
`

const StyledListItem = styled(ListItem)`
  min-height: unset;
  border-radius: var(--es-border-radius-0);

  ${({ $active }) => {
    if ($active) {
      return `
        border: 1.75px solid var(--es-theme-border-primary-selected);
      `
    } else {
      return `
        border: 1.75px solid var(--es-theme-border-primary-default);
      `
    }
  }}
`

const badgePropsMap = {
  [APPOINTMENT_STATE.SCHEDULED]: {
    variant: 'info',
    children: '就診預約',
  },
  [APPOINTMENT_STATE.COMPLETED]: {
    variant: 'positive',
    children: '就診完成',
  },
  [APPOINTMENT_STATE.CANCELLED]: {
    variant: 'secondary',
    children: '取消預約',
  },
  [APPOINTMENT_STATE.ABSENT]: {
    variant: 'negative',
    children: '無故缺席',
  },
}

const AppointmentThead = () => (
  <thead>
    <tr>
      <StyledTh leftIndent>
        <Label size="s" variant="tertiary">
          時段
        </Label>
      </StyledTh>
      <StyledTh>
        <Label size="s" variant="tertiary">
          就診人
        </Label>
      </StyledTh>
      <StyledTh>
        <Label size="s" variant="tertiary">
          醫師
        </Label>
      </StyledTh>
      <StyledTh>
        <Label size="s" variant="tertiary">
          門診類別
        </Label>
      </StyledTh>
      <StyledTh rightIndent>
        <Label size="s" variant="tertiary">
          狀態
        </Label>
      </StyledTh>
    </tr>
  </thead>
)

const AppointmentTr = ({
  appointment,
  endUserCollection,
  internalUserCollection,
  serviceProductCollection,
  ...rest
}) => {
  const endUser = endUserCollection.map[appointment.end_user_reference]
  const internalUser =
    internalUserCollection.map[
      appointment.internal_user_appointment_time_slots[0]
        .internal_user_reference
    ]
  const serviceProduct =
    serviceProductCollection.map[appointment.service_product_reference]
  return (
    <Table.Tr pointer {...rest}>
      <Table.Td leftIndent>
        <Text size="s">
          {get_local_datetime(
            appointment.evaluated_time_slot.start_time,
            'yyyy-MM-dd'
          )}
          &nbsp;&nbsp;&nbsp;&nbsp;
          {`${get_local_datetime(
            appointment.evaluated_time_slot.start_time,
            'HH:mm'
          )} - ${get_local_datetime(
            appointment.evaluated_time_slot.end_time,
            'HH:mm'
          )}`}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="s">{get_full_name(endUser)}</Text>
      </Table.Td>
      <Table.Td>
        <Inline gap="s">
          <Image
            rounded
            width={24}
            height={24}
            src={internalUser?.avatar_src}
          />
          <Text size="s">{get_full_name(internalUser)}</Text>
        </Inline>
      </Table.Td>
      <Table.Td>
        <Text size="s">{serviceProduct?.display_sku_key}</Text>
      </Table.Td>
      <Table.Td rightIndent>
        <Badge {...badgePropsMap[appointment.state]} />
      </Table.Td>
    </Table.Tr>
  )
}

const AppointmentAppointmentsPage = () => {
  const paginator = usePaginator()
  const { tab, setTab } = useRouterTab('今日診次')
  const [single_day_appointments, set_single_day_appointments] = useState([])
  const [appointments, set_appointments] = useState([])
  const [filterParams, setFilterParams] = useState()
  const { organization } = useCurrentOrganization()
  const endUserCollection = useEndUserCollection()
  const internalUserCollection = useInternalUserCollection()
  const serviceProductCollection = useServiceProductCollection()
  const [createAppointmentStage, setUpsertAppointmentStage] = useState(
    UpsertAppointmentStage.SELECT_END_USER_TYPE
  )
  const [upsertMode, setUpsertMode] = useState()
  const [isDisplayingSearchResult, setIsDisplayingSearchResult] =
    useState(false)
  const controlFlowForm = useForm()
  const upsertAppointmentForm = useForm()
  const createEndUserForm = useForm()
  const searchAppointmentForm = useForm()
  const [activeAppointment, setActiveAppointment] = useState()
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [showUpsertAppointmentModal, setShowUpsertAppointmentModal] =
    useState(false)
  const [searched_end_users, set_searched_end_users] = useState([])
  const [internal_user_references, set_internal_user_references] = useState([])
  const [service_products, set_service_products] = useState([])
  const [selectableTimeSlotMap, setSelectableTimeSlotMap] = useState({})
  const [selectableTimeSlots, setSelectableTimeSlots] = useState([])
  const [selectedDate, setSelectedDate] = useState()
  const router = useRouter()
  const { organization_uuid } = router.query

  useEffect(() => {
    async function fetchAppointments(filterParams) {
      await harrisonApiAgent.get(
        `/scheduling/organizations/${organization_uuid}/single_day_appointments`,
        {
          params: {
            filter: filterParams,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_single_day_appointments(data)
          },
        }
      )
    }
    if (organization_uuid) {
      const localNow = new Date()
      const startOfToday = startOfDay(localNow)
      const startOfTomorrow = addDays(startOfToday, 1)
      const startOfTheDayAfterTomorrow = addDays(startOfToday, 2)
      if (tab === '今日診次') {
        fetchAppointments({
          type: AppointmentFilterTypes
            .START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE.type,
          query: {
            start_time: local_to_utc(startOfToday),
            end_time: local_to_utc(startOfTomorrow),
            state: null,
          },
        })
      } else if (tab === '明日診次') {
        fetchAppointments({
          type: AppointmentFilterTypes
            .START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE.type,
          query: {
            start_time: local_to_utc(startOfTomorrow),
            end_time: local_to_utc(startOfTheDayAfterTomorrow),
            state: null,
          },
        })
      }
    }
  }, [organization_uuid, tab])

  useEffect(() => {
    async function fetchAppointments() {
      await harrisonApiAgent.get(
        `/scheduling/organizations/${organization_uuid}/appointments`,
        {
          params: {
            filter: filterParams,
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_appointments(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization_uuid) {
      fetchAppointments()
    }
  }, [organization_uuid, filterParams, paginator.activePageToken])

  useEffect(() => {
    if (tab === '所有診次') {
      set_appointments([])
      paginator.reset()
      setFilterParams({
        type: AppointmentFilterTypes
          .START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE.type,
        query: {
          start_time: null,
          end_time: null,
          state: null,
        },
      })
    }
  }, [tab])

  useEffect(() => {
    ;[...single_day_appointments, ...appointments].forEach((appointment) => {
      endUserCollection.addReference(appointment.end_user_reference)
      internalUserCollection.addReference(
        appointment.internal_user_appointment_time_slots[0]
          .internal_user_reference
      )
      serviceProductCollection.addReference(
        appointment.service_product_reference
      )
    })
  }, [single_day_appointments, appointments])

  useEffect(() => {
    const s = new Set()
    service_products.forEach((service_product) => {
      service_product.service_product_internal_users.forEach((spiu) => {
        internalUserCollection.addReference(spiu.internal_user_reference)
        s.add(spiu.internal_user_reference)
      })
    })
    set_internal_user_references(Array.from(s))
  }, [service_products])

  useEffect(() => {
    if (selectedDate) {
      const key = format(selectedDate, 'yyyy-MM-dd')
      setSelectableTimeSlots(selectableTimeSlotMap[key])
    }
  }, [selectedDate])

  const handleHideAppointmentModal = () => {
    setShowAppointmentModal(false)
  }

  const handleHideUpsertAppointmentModal = () => {
    controlFlowForm.reset({
      endUserType: null,
    })
    upsertAppointmentForm.reset({
      end_user_reference: null,
      internal_user_reference: null,
      service_product_reference: null,
    })
    setUpsertAppointmentStage(UpsertAppointmentStage.SELECT_END_USER_TYPE)
    setShowUpsertAppointmentModal(false)
  }

  const handleSearchEndUsersClick = async () => {
    upsertAppointmentForm.reset({ end_user_reference: null })
    await harrisonApiAgent.get(
      `/iam/organizations/${organization_uuid}/end_users`,
      {
        params: {
          filter: {
            type: EndUserFilterTypes.NAME.type,
            query: controlFlowForm.getValues('endUserQuery'),
          },
        },
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: ({ enhanced_data }) => {
          set_searched_end_users(enhanced_data)
        },
      }
    )
  }

  const fetchServiceProducts = async () => {
    await harrisonApiAgent.get(
      `/product/organizations/${organization_uuid}/service_products/unexpired`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_service_products(data)
        },
      }
    )
  }

  const handleSearchAvailableTime = async (localStartTime) => {
    setSelectedDate()
    await harrisonApiAgent.get(
      `/scheduling/organizations/${organization_uuid}/internal_user_time_slot_inventories/available`,
      {
        params: {
          internal_user_references: [
            upsertAppointmentForm.watch('internal_user_reference'),
          ],
          start_time: local_to_utc(localStartTime),
          end_time: local_to_utc(endOfMonth(localStartTime)),
        },
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          const tzOffset = new Date().getTimezoneOffset()
          let timeSlots = data.map((iutsi) => iutsi.time_slot)
          if (
            upsertMode === UpsertMode.UPDATE &&
            upsertAppointmentForm.getValues('internal_user_reference') ===
              activeAppointment.internal_user_appointment_time_slots[0]
                .internal_user_reference
          ) {
            // append time slots that were allocated to current appointment
            timeSlots.push(activeAppointment.evaluated_time_slot)
          }
          const selectableTimeSlotMap = timeSlots.reduce((m, time_slot) => {
            const timeSlot = {
              startTime: subMinutes(parseISO(time_slot.start_time), tzOffset),
              endTime: subMinutes(parseISO(time_slot.end_time), tzOffset),
            }
            const key = format(timeSlot.startTime, 'yyyy-MM-dd')
            if (!(key in m)) {
              m[key] = []
            }
            m[key].push(timeSlot)
            return m
          }, {})
          const serviceProduct = service_products.find(
            (sp) =>
              sp.reference ===
              upsertAppointmentForm.watch('service_product_reference')
          )
          for (const [key, timeSlots] of Object.entries(
            selectableTimeSlotMap
          )) {
            selectableTimeSlotMap[key] = getFilteredTimeSlots(
              getQuantizedTimeSlots(
                timeSlots,
                serviceProduct.duration_in_time_slots * 5
              ),
              1
            )
          }
          setSelectableTimeSlotMap(selectableTimeSlotMap)
        },
      }
    )
  }

  const handleSubmitSearchAppointmentForm = async (payload) => {
    setIsDisplayingSearchResult(true)
    let query = {}
    if (payload.startTime) {
      query.start_time = local_to_utc(payload.startTime)
    }
    if (payload.endTime) {
      query.end_time = local_to_utc(payload.endTime)
    }
    if (payload.name) {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization.reference}/end_users`,
        {
          params: {
            filter: {
              type: EndUserFilterTypes.NAME.type,
              query: payload.name,
            },
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            query.end_user_references = enhanced_data.map(
              (end_user) => end_user.reference
            )
          },
        }
      )
    }
    if (payload.state) {
      query.state = payload.state
    }
    paginator.reset()
    setFilterParams({
      type: AppointmentFilterTypes
        .START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE.type,
      query,
    })
  }

  const clearSearchResult = () => {
    setIsDisplayingSearchResult(false)
    searchAppointmentForm.reset({
      startTime: null,
      endTime: null,
      name: null,
      state: null,
    })
    paginator.reset()
    setFilterParams({
      type: AppointmentFilterTypes
        .START_TIME_AND_END_TIME_AND_END_USER_REFERENCES_AND_STATE.type,
      query: {
        start_time: null,
        end_time: null,
        name: null,
        state: null,
      },
    })
  }

  const handleSubmitCreateEndUserForm = async (payload) => {
    await harrisonApiAgent.post(
      `/iam/organizations/${organization.reference}/end_users`,
      {
        ...payload,
        phone_number: normalize_phone_number('+886', payload.phone_number),
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          upsertAppointmentForm.setValue('end_user_reference', data.reference)
          fetchServiceProducts()
          setUpsertAppointmentStage(
            UpsertAppointmentStage.SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT
          )
        },
      }
    )
  }

  const handleSubmitUpsertAppointmentForm = async (payload) => {
    if (upsertMode === UpsertMode.CREATE) {
      const appointmentReference = uuidv4()
      await harrisonApiAgent.post(
        `/scheduling/organizations/${organization_uuid}/appointments`,
        {
          reference: appointmentReference,
          end_user_reference: payload.end_user_reference,
          internal_user_references: [payload.internal_user_reference],
          service_product_reference: payload.service_product_reference,
          start_time: local_to_utc(payload.start_time),
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
    } else if (upsertMode === UpsertMode.UPDATE) {
      await harrisonApiAgent.patch(
        `/scheduling/organizations/${organization_uuid}/appointments/${activeAppointment.reference}`,
        {
          end_user_reference: payload.end_user_reference,
          internal_user_references: [payload.internal_user_reference],
          service_product_reference: payload.service_product_reference,
          start_time: local_to_utc(payload.start_time),
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
  }

  const handleCancelAppointmentButtonClick = () => {
    harrisonApiAgent.post(
      `/scheduling/organizations/${organization_uuid}/appointments/${activeAppointment.reference}/cancel`,
      null,
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

  const handleRescheduleAppointmentButtonClick = () => {
    setShowAppointmentModal(false)
    setUpsertMode(UpsertMode.UPDATE)
    setUpsertAppointmentStage(UpsertAppointmentStage.SELECT_EXISTING_END_USER)
    setShowUpsertAppointmentModal(true)
    set_searched_end_users([
      endUserCollection.map[activeAppointment.end_user_reference],
    ])
    upsertAppointmentForm.reset({
      organization_reference: organization_uuid,
      internal_user_reference:
        activeAppointment.internal_user_appointment_time_slots[0]
          .internal_user_reference,
      service_product_reference: activeAppointment.service_product_reference,
    })
  }

  return (
    <OrganizationAppointmentPageLayout>
      <Page>
        <Page.Header
          title="預約總覽"
          rightControl={
            <Button
              variant="primary"
              inversed
              prefix={<Icon inversed name="add" />}
              onClick={() => {
                setUpsertMode(UpsertMode.CREATE)
                setShowUpsertAppointmentModal(true)
              }}
            >
              建立預約
            </Button>
          }
          tab={
            <Tab type="underline">
              <Tab.Item
                active={tab === '今日診次'}
                onClick={() => setTab('今日診次')}
              >
                今日診次
              </Tab.Item>
              <Tab.Item
                active={tab === '明日診次'}
                onClick={() => setTab('明日診次')}
              >
                明日診次
              </Tab.Item>
              <Tab.Item
                active={tab === '所有診次'}
                onClick={() => setTab('所有診次')}
              >
                所有診次
              </Tab.Item>
            </Tab>
          }
        />

        {(tab === '今日診次' || tab === '明日診次') && (
          <>
            <Container size="l" style={{ background: 'transparent' }}>
              <Heading size="xs">就診預約</Heading>
            </Container>
            <Page.Section size={false}>
              <StyledTable fluid>
                <AppointmentThead />
                <tbody>
                  {single_day_appointments
                    .filter(
                      (appointment) =>
                        appointment.state !== APPOINTMENT_STATE.CANCELLED
                    )
                    .sort((a, b) => {
                      if (
                        a.evaluated_time_slot.start_time <
                        b.evaluated_time_slot.start_time
                      ) {
                        return -1
                      } else if (
                        a.evaluated_time_slot.start_time >
                        b.evaluated_time_slot.start_time
                      ) {
                        return 1
                      } else {
                        return 0
                      }
                    })
                    .map((appointment) => (
                      <AppointmentTr
                        key={appointment.reference}
                        appointment={appointment}
                        endUserCollection={endUserCollection}
                        internalUserCollection={internalUserCollection}
                        serviceProductCollection={serviceProductCollection}
                        onClick={() => {
                          setActiveAppointment(appointment)
                          setShowAppointmentModal(true)
                        }}
                      />
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <Table.Td crossRow />
                  </tr>
                </tfoot>
              </StyledTable>
            </Page.Section>
            <Spacer ySize="xl" />
            <Container size="l" style={{ background: 'transparent' }}>
              <Heading size="xs">取消預約</Heading>
            </Container>
            <Page.Section size={false}>
              <StyledTable fluid>
                <AppointmentThead />
                <tbody>
                  {single_day_appointments
                    .filter(
                      (appointment) =>
                        appointment.state === APPOINTMENT_STATE.CANCELLED
                    )
                    .sort((a, b) => {
                      if (
                        a.evaluated_time_slot.start_time <
                        b.evaluated_time_slot.start_time
                      ) {
                        return -1
                      } else if (
                        a.evaluated_time_slot.start_time >
                        b.evaluated_time_slot.start_time
                      ) {
                        return 1
                      } else {
                        return 0
                      }
                    })
                    .map((appointment) => (
                      <AppointmentTr
                        key={appointment.reference}
                        appointment={appointment}
                        endUserCollection={endUserCollection}
                        internalUserCollection={internalUserCollection}
                        serviceProductCollection={serviceProductCollection}
                        onClick={() => {
                          setActiveAppointment(appointment)
                          setShowAppointmentModal(true)
                        }}
                      />
                    ))}
                </tbody>
                <tfoot>
                  <tr>
                    <Table.Td crossRow />
                  </tr>
                </tfoot>
              </StyledTable>
            </Page.Section>
          </>
        )}

        {tab === '所有診次' && (
          <>
            <Page.Section size={false}>
              <Container>
                <Inline gap="l" alignItems="center">
                  <Input
                    style={{
                      background: 'var(--es-theme-bg-primary-hovered)',
                    }}
                    size="s"
                    type="datetime-local"
                    placeholder="門診開始時段"
                    disabled={isDisplayingSearchResult}
                    {...searchAppointmentForm.register('startTime')}
                  />
                  <Input
                    style={{
                      background: 'var(--es-theme-bg-primary-hovered)',
                    }}
                    size="s"
                    type="datetime-local"
                    placeholder="門診結束時段"
                    disabled={isDisplayingSearchResult}
                    {...searchAppointmentForm.register('endTime')}
                  />
                  <Input
                    style={{
                      background: 'var(--es-theme-bg-primary-hovered)',
                    }}
                    size="s"
                    type="text"
                    placeholder="就診人姓名"
                    disabled={isDisplayingSearchResult}
                    {...searchAppointmentForm.register('name')}
                  />
                  <Controller
                    control={searchAppointmentForm.control}
                    name="state"
                    render={({ field }) => (
                      <DropdownSelect
                        style={{
                          background: 'var(--es-theme-bg-primary-hovered)',
                        }}
                        size="s"
                        placeholder="就診狀態"
                        disabled={isDisplayingSearchResult}
                        options={Object.entries(badgePropsMap).map(
                          ([state, prop]) => ({
                            value: state,
                            label: prop.children,
                          })
                        )}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {isDisplayingSearchResult ? (
                    <Button
                      size="s"
                      variant="primary"
                      prefix={<Icon name="clear" />}
                      onClick={clearSearchResult}
                    >
                      清空
                    </Button>
                  ) : (
                    <Button
                      size="s"
                      inversed
                      variant="primary"
                      prefix={<Icon name="search" inversed />}
                      onClick={searchAppointmentForm.handleSubmit(
                        handleSubmitSearchAppointmentForm
                      )}
                    >
                      搜尋
                    </Button>
                  )}
                </Inline>
              </Container>
              <StyledTable fluid>
                <AppointmentThead />
                <tbody>
                  {appointments.map((appointment) => (
                    <AppointmentTr
                      key={appointment.reference}
                      appointment={appointment}
                      endUserCollection={endUserCollection}
                      internalUserCollection={internalUserCollection}
                      serviceProductCollection={serviceProductCollection}
                      onClick={() => {
                        setActiveAppointment(appointment)
                        setShowAppointmentModal(true)
                      }}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <Table.Td crossRow />
                  </tr>
                </tfoot>
              </StyledTable>
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
                    <Label size="s">
                      {paginator.activePage?.count_all_page}
                    </Label>
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
                              appointments.length ===
                            paginator.activePage?.count_all_page
                          return defaultIsNextDisabled || isLastPage
                        }
                      )}
                    />
                  </Inline>
                </Inline>
              </Inline>
            </Page.Footer>
          </>
        )}
      </Page>

      <Modal
        show={showAppointmentModal}
        onHide={handleHideAppointmentModal}
        style={{
          width: 600,
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
              <Label size="l">預約內容</Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideAppointmentModal}
              />
            </Inline>
            <Stack gap="l" fluid style={{ maxHeight: 600, overflowY: 'auto' }}>
              <Container fluid>
                <Stack gap="m">
                  <Heading size="m">
                    {get_full_name(
                      endUserCollection.map[
                        activeAppointment?.end_user_reference
                      ]
                    )}
                  </Heading>
                  <Label size="m" variant="secondary">
                    {
                      serviceProductCollection.map[
                        activeAppointment?.service_product_reference
                      ]?.display_sku_key
                    }
                  </Label>
                  <Inline gap="s" alignItems="center">
                    <Badge>
                      {serviceProductCollection.map[
                        activeAppointment?.service_product_reference
                      ]?.service_product_insurers.length > 0
                        ? '健保'
                        : '自費'}
                    </Badge>
                    <Inline gap="xs" alignItems="center">
                      <Icon name="schedule" fill={false} variant="tertiary" />
                      <Label size="s" variant="tertiary">
                        門診長度
                      </Label>
                      <Label size="s" variant="tertiary">
                        {serviceProductCollection.map[
                          activeAppointment?.service_product_reference
                        ]?.duration_in_time_slots * 5}{' '}
                        mins
                      </Label>
                    </Inline>
                    <Inline gap="xs" alignItems="center">
                      <Icon
                        name="attach_money"
                        fill={false}
                        variant="tertiary"
                      />
                      <Label size="s" variant="tertiary">
                        掛號費
                      </Label>
                      <Label size="s" variant="tertiary">
                        {
                          serviceProductCollection.map[
                            activeAppointment?.service_product_reference
                          ]?.registration_fee_amount
                        }
                      </Label>
                    </Inline>
                  </Inline>
                  <Text size="xs" variant="tertiary">
                    {
                      serviceProductCollection.map[
                        activeAppointment?.service_product_reference
                      ]?.display_description_key
                    }
                  </Text>
                </Stack>
              </Container>
              <Stack fluid>
                <ListItem>
                  <ListItem.Media>
                    <Icon name="meeting_room" sizeInPixel={24} />
                  </ListItem.Media>
                  <ListItem.Content
                    title={get_organization_name(organization)}
                    paragraph={organization?.correspondence_address}
                  />
                </ListItem>
                <ListItem>
                  <Icon name="person" sizeInPixel={24} />
                  <Spacer xSize="l" />
                  <ListItem.Content
                    title={get_full_name(
                      internalUserCollection.map[
                        activeAppointment
                          ?.internal_user_appointment_time_slots[0]
                          ?.internal_user_reference
                      ]
                    )}
                    paragraph="醫師"
                  />
                  <ListItem.Media
                    image={{
                      src: internalUserCollection.map[
                        activeAppointment
                          ?.internal_user_appointment_time_slots[0]
                          ?.internal_user_reference
                      ]?.avatar_src,
                      width: 40,
                      height: 40,
                      rounded: true,
                    }}
                  />
                </ListItem>
                <ListItem>
                  <ListItem.Media>
                    <Icon name="access_time" fill={false} sizeInPixel={24} />
                  </ListItem.Media>
                  <ListItem.Content
                    title={get_local_datetime(
                      activeAppointment?.evaluated_time_slot?.start_time,
                      'yyyy-MM-dd'
                    )}
                    paragraph={`${get_local_datetime(
                      activeAppointment?.evaluated_time_slot?.start_time,
                      'HH:mm'
                    )} - ${get_local_datetime(
                      activeAppointment?.evaluated_time_slot?.end_time,
                      'HH:mm'
                    )}`}
                  />
                </ListItem>
              </Stack>
              <Container>
                <Stack gap="m">
                  <Heading size="s" variant="primary">
                    注意事項
                  </Heading>
                  <Text size="s" variant="secondary">
                    {
                      serviceProductCollection.map[
                        activeAppointment?.service_product_reference
                      ]?.display_note
                    }
                  </Text>
                </Stack>
              </Container>
            </Stack>
            <Container fluid>
              {activeAppointment?.state === APPOINTMENT_STATE.SCHEDULED ? (
                <Inline gap="s">
                  <Button
                    fluid
                    variant="negative"
                    onClick={handleCancelAppointmentButtonClick}
                  >
                    取消預約
                  </Button>
                  <Button
                    fluid
                    variant="primary"
                    onClick={handleRescheduleAppointmentButtonClick}
                  >
                    編輯診次
                  </Button>
                </Inline>
              ) : (
                <Button fluid variant="negative" disabled>
                  已取消預約
                </Button>
              )}
            </Container>
          </Stack>
        </Container>
      </Modal>

      <Modal
        show={showUpsertAppointmentModal}
        onHide={handleHideUpsertAppointmentModal}
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
          <Stack fluid gap="xl">
            <Inline fluid justifyContent="space-between">
              <Label size="l">
                {upsertMode === UpsertMode.CREATE ? '建立預約' : '修改預約'}
              </Label>
              <Icon
                sizeInPixel={24}
                name="close"
                pointer
                onClick={handleHideUpsertAppointmentModal}
              />
            </Inline>
            {createAppointmentStage ===
              UpsertAppointmentStage.SELECT_END_USER_TYPE && (
              <>
                <Stack fluid gap="xl">
                  <Field as={Stack} fluid gap="l">
                    <Heading size="s" variant="primary">
                      客戶種類
                    </Heading>
                    <Inline fluid gap="m">
                      <Field fluid as={Inline} gap="s" alignItems="center">
                        <Input
                          {...controlFlowForm.register('endUserType')}
                          type="radio"
                          id="new_end_user"
                          value="new_end_user"
                        />
                        <Label
                          htmlFor="new_end_user"
                          size="xs"
                          variant="secondary"
                        >
                          新客戶/還沒有帳號
                        </Label>
                      </Field>
                      <Field fluid as={Inline} gap="s" alignItems="center">
                        <Input
                          {...controlFlowForm.register('endUserType')}
                          type="radio"
                          id="existing_end_user"
                          value="existing_end_user"
                        />
                        <Label
                          htmlFor="existing_end_user"
                          size="xs"
                          variant="secondary"
                        >
                          舊客戶/已經有帳號
                        </Label>
                      </Field>
                    </Inline>
                  </Field>
                </Stack>
                <Inline fluid gap="s" justifyContent="end">
                  <Button onClick={handleHideUpsertAppointmentModal}>
                    取消
                  </Button>
                  <Button
                    inversed
                    variant="primary"
                    disabled={!controlFlowForm.watch('endUserType')}
                    onClick={() => {
                      const { endUserType } = controlFlowForm.getValues()
                      upsertAppointmentForm.reset({
                        end_user_reference: null,
                      })
                      if (endUserType == 'new_end_user') {
                        setUpsertAppointmentStage(
                          UpsertAppointmentStage.CREATE_NEW_END_USER
                        )
                      } else if (endUserType == 'existing_end_user') {
                        controlFlowForm.reset({
                          endUserQuery: null,
                        })
                        set_searched_end_users([])
                        setUpsertAppointmentStage(
                          UpsertAppointmentStage.SELECT_EXISTING_END_USER
                        )
                      }
                    }}
                  >
                    下一步
                  </Button>
                </Inline>
              </>
            )}
            {createAppointmentStage ===
              UpsertAppointmentStage.CREATE_NEW_END_USER && (
              <>
                <Stack fluid gap="m">
                  <Field as={Stack} fluid gap="s">
                    <Label size="s" variant="tertiary">
                      姓氏
                    </Label>
                    <Input
                      fluid
                      placeholder="輸入就診人姓氏"
                      {...createEndUserForm.register('last_name')}
                    />
                  </Field>
                  <Field as={Stack} fluid gap="s">
                    <Label size="s" variant="tertiary">
                      名字
                    </Label>
                    <Input
                      fluid
                      placeholder="輸入就診人名字"
                      {...createEndUserForm.register('first_name')}
                    />
                  </Field>
                  <Field as={Stack} fluid gap="s">
                    <Label size="s" variant="tertiary">
                      聯絡電話
                    </Label>
                    <Input
                      fluid
                      placeholder="輸入聯絡電話"
                      {...createEndUserForm.register('phone_number')}
                    />
                  </Field>
                  <Field as={Stack} fluid gap="s">
                    <Label size="s" variant="tertiary">
                      Email
                    </Label>
                    <Input
                      fluid
                      placeholder="輸入他的Email"
                      {...createEndUserForm.register('email_address')}
                    />
                  </Field>
                </Stack>
                <Inline fluid gap="s" justifyContent="space-between">
                  <Button
                    onClick={() => {
                      setUpsertAppointmentStage(
                        UpsertAppointmentStage.SELECT_END_USER_TYPE
                      )
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    inversed
                    variant="primary"
                    disabled={
                      !createEndUserForm.watch('first_name') ||
                      !createEndUserForm.watch('last_name') ||
                      (!createEndUserForm.watch('phone_number') &&
                        !createEndUserForm.watch('email_address'))
                    }
                    loading={createEndUserForm.formState.isSubmitting}
                    onClick={createEndUserForm.handleSubmit(
                      handleSubmitCreateEndUserForm
                    )}
                  >
                    創建帳號
                  </Button>
                </Inline>
              </>
            )}
            {createAppointmentStage ===
              UpsertAppointmentStage.SELECT_EXISTING_END_USER && (
              <>
                <Stack fluid gap="l">
                  <Field as={Inline} fluid gap="l" alignItems="center">
                    <Input
                      style={{ flexGrow: 1 }}
                      placeholder="搜尋複診客人"
                      {...controlFlowForm.register('endUserQuery')}
                    />
                    <Button
                      inversed
                      variant="primary"
                      disabled={!controlFlowForm.watch('endUserQuery')}
                      onClick={handleSearchEndUsersClick}
                    >
                      搜尋
                    </Button>
                  </Field>
                  <Stack
                    fluid
                    gap="l"
                    style={{ maxHeight: 250, overflowY: 'auto' }}
                  >
                    {searched_end_users.map((end_user) => {
                      const isActive =
                        upsertAppointmentForm.getValues(
                          'end_user_reference'
                        ) === end_user.reference
                      return (
                        <StyledListItem
                          key={end_user.reference}
                          controlScope="all"
                          verticallyCentered
                          $active={isActive}
                          onClick={() =>
                            upsertAppointmentForm.setValue(
                              'end_user_reference',
                              end_user.reference
                            )
                          }
                        >
                          <ListItem.Content
                            title={get_full_name(end_user)}
                            paragraph={end_user.phone_number}
                          />
                          <ListItem.Control
                            icon={{
                              fill: false,
                              name: isActive
                                ? 'radio_button_checked'
                                : 'radio_button_unchecked',
                            }}
                          />
                        </StyledListItem>
                      )
                    })}
                  </Stack>
                </Stack>
                <Inline
                  fluid
                  gap="s"
                  justifyContent={
                    upsertMode === UpsertMode.CREATE ? 'space-between' : 'end'
                  }
                >
                  {upsertMode === UpsertMode.CREATE && (
                    <Button
                      onClick={() => {
                        setUpsertAppointmentStage(
                          UpsertAppointmentStage.SELECT_END_USER_TYPE
                        )
                      }}
                    >
                      上一步
                    </Button>
                  )}
                  <Button
                    inversed
                    variant="primary"
                    disabled={
                      !upsertAppointmentForm.watch('end_user_reference')
                    }
                    onClick={() => {
                      fetchServiceProducts()
                      setUpsertAppointmentStage(
                        UpsertAppointmentStage.SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT
                      )
                    }}
                  >
                    下一步
                  </Button>
                </Inline>
              </>
            )}
            {createAppointmentStage ===
              UpsertAppointmentStage.SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT && (
              <>
                <Stack fluid gap="xl">
                  <Field as={Stack} gap="m" fluid>
                    <Label>選擇醫師</Label>
                    <Controller
                      control={upsertAppointmentForm.control}
                      name="internal_user_reference"
                      render={({ field }) => (
                        <Inline fluid gap="s">
                          {internal_user_references.map((iur) => {
                            const internalUser = internalUserCollection.map[iur]
                            return (
                              <Card
                                key={iur}
                                centered
                                inset
                                controlScope="all"
                                active={field.value === iur}
                                onClick={() => {
                                  field.onChange(iur)
                                  upsertAppointmentForm.setValue(
                                    'service_product_reference',
                                    null
                                  )
                                }}
                              >
                                <Card.Media
                                  image={{
                                    fluid: false,
                                    width: 64,
                                    height: 64,
                                    rounded: true,
                                    src: internalUser?.avatar_src,
                                  }}
                                />
                                <Card.Content
                                  title={get_full_name(internalUser)}
                                  paragraph="醫師"
                                />
                              </Card>
                            )
                          })}
                        </Inline>
                      )}
                    />
                  </Field>
                  <Field as={Stack} gap="m" fluid>
                    <Label>選擇服務</Label>
                    <Controller
                      control={upsertAppointmentForm.control}
                      name="service_product_reference"
                      render={({ field }) => {
                        const selectedInternalUserReference =
                          upsertAppointmentForm.watch('internal_user_reference')
                        return (
                          <DropdownSelect
                            fluid
                            placeholder="選擇服務內容"
                            disabled={!selectedInternalUserReference}
                            options={service_products
                              .filter((sp) =>
                                sp.service_product_internal_users.find(
                                  (spiu) =>
                                    spiu.internal_user_reference ===
                                    selectedInternalUserReference
                                )
                              )
                              .map((sp) => ({
                                value: sp.reference,
                                label: sp.display_sku_key,
                              }))}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )
                      }}
                    />
                  </Field>
                </Stack>
                <Inline fluid gap="s" justifyContent="space-between">
                  <Button
                    onClick={() => {
                      if (upsertMode === UpsertMode.CREATE) {
                        upsertAppointmentForm.reset({
                          internal_user_reference: null,
                          service_product_reference: null,
                        })
                      }
                      setUpsertAppointmentStage(
                        UpsertAppointmentStage.SELECT_EXISTING_END_USER
                      )
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    inversed
                    variant="primary"
                    disabled={
                      !upsertAppointmentForm.watch('internal_user_reference') ||
                      !upsertAppointmentForm.watch('service_product_reference')
                    }
                    onClick={() => {
                      handleSearchAvailableTime(new Date())
                      setUpsertAppointmentStage(
                        UpsertAppointmentStage.SELECT_START_TIME
                      )
                    }}
                  >
                    下一步
                  </Button>
                </Inline>
              </>
            )}
            {createAppointmentStage ===
              UpsertAppointmentStage.SELECT_START_TIME && (
              <>
                <Container fluid size={false}>
                  <MonthlyCalendar
                    isDateSelectable={(date) => {
                      if (date < startOfDay(new Date())) {
                        return false
                      }
                      const selectableTimeSlots =
                        selectableTimeSlotMap[format(date, 'yyyy-MM-dd')]
                      return selectableTimeSlots?.length > 0
                    }}
                    isDateActive={(date) =>
                      date.getTime() === selectedDate?.getTime()
                    }
                    isGoPrevDisabled={(currentStartOfMonth) => {
                      return currentStartOfMonth <= new Date()
                    }}
                    onMonthChange={(currentStartOfMonth) => {
                      handleSearchAvailableTime(currentStartOfMonth)
                    }}
                    onSelectDate={(date) => {
                      setSelectedDate(date)
                      upsertAppointmentForm.setValue('start_time', null)
                    }}
                  />
                </Container>
                {selectedDate && (
                  <Container fluid size={false}>
                    <Controller
                      control={upsertAppointmentForm.control}
                      name="start_time"
                      render={({ field }) => (
                        <TimeIntervalCalendar
                          title="選擇以下時段"
                          selectableTimeSlots={selectableTimeSlots}
                          isDateActive={(date) =>
                            upsertAppointmentForm
                              .watch('start_time')
                              ?.getTime?.() === date.getTime()
                          }
                          isGoPrevTimeDisabled={(
                            currentBatch,
                            _batchOfDates
                          ) => {
                            return currentBatch === 0
                          }}
                          isGoNextTimeDisabled={(
                            currentBatch,
                            batchOfDates
                          ) => {
                            return (
                              batchOfDates.length === 0 ||
                              currentBatch === batchOfDates.length - 1
                            )
                          }}
                          onSelectDate={(date) => {
                            field.onChange(date)
                          }}
                        />
                      )}
                    />
                  </Container>
                )}
                <Inline fluid gap="s" justifyContent="space-between">
                  <Button
                    onClick={() => {
                      setSelectedDate()
                      setUpsertAppointmentStage(
                        UpsertAppointmentStage.SELECT_INTERNAL_USER_AND_SERVICE_PRODUCT
                      )
                    }}
                  >
                    上一步
                  </Button>
                  <Button
                    inversed
                    variant="primary"
                    disabled={!upsertAppointmentForm.watch('start_time')}
                    loading={upsertAppointmentForm.formState.isSubmitting}
                    onClick={upsertAppointmentForm.handleSubmit(
                      handleSubmitUpsertAppointmentForm
                    )}
                  >
                    完成
                  </Button>
                </Inline>
              </>
            )}
          </Stack>
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

export default AppointmentAppointmentsPage
