import Button from '@esen/essence/components/Button'
import Card from '@esen/essence/components/Card'
import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Offcanvas from '@esen/essence/components/Offcanvas'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import MonthlyCalendar from '@esen/utils/components/MonthlyCalendar'
import TimeIntervalCalendar from '@esen/utils/components/TimeIntervalCalendar'
import { get_full_name, local_to_utc } from '@esen/utils/fn'
import {
  getFilteredTimeSlots,
  getQuantizedTimeSlots,
} from '@esen/utils/functions/appointment'
import { useInternalUserCollection } from '@esen/utils/hooks/useInternalUserCollection'
import { useServiceProductCollection } from '@esen/utils/hooks/useServiceProductCollection'
import useTrack from '@esen/utils/hooks/useTrack'
import endOfMonth from 'date-fns/endOfMonth'
import format from 'date-fns/format'
import parseISO from 'date-fns/parseISO'
import startOfDay from 'date-fns/startOfDay'
import subMinutes from 'date-fns/subMinutes'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import ModalNavbar from '../../../components/navigation/ModalNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const ESEN_CLINIC_ORGANIZATION_UUID = '0cbc6a66-4c84-4b8c-9534-0e000b1d26dc'

const Stage = {
  FILL_PRINCIPAL: 'FILL_PRINCIPAL',
  SELECT_SERVICE: 'SELECT_SERVICE',
  SELECT_DATETIME: 'SELECT_DATETIME',
}

const ServiceInsurerTabs = ['健保門診', '自費門診']

const UpdateAppointmentPage = () => {
  const router = useRouter()
  const [track] = useTrack()
  const updateAppointmentForm = useForm()
  const internalUserCollection = useInternalUserCollection()
  const serviceProductCollection = useServiceProductCollection()
  const [appointment, set_appointment] = useState()
  const [stage, set_stage] = useState()
  const [service_products, set_service_products] = useState([])
  const [internalUserReferenceSet, setInternalUserReferenceSet] = useState([])
  const [available_service_products, set_available_service_products] = useState(
    []
  )
  const [active_service_product, set_active_service_product] = useState()
  const [showCooperationCodeOffcanvas, setShowCooperationCodeOffcanvas] =
    useState()
  const [typedCooperationCodeCode, setTypedCooperationCodeCode] = useState('')
  const [selectedDate, setSelectedDate] = useState()
  const [selectableTimeSlotMap, setSelectableTimeSlotMap] = useState({})
  const [selectableTimeSlots, setSelectableTimeSlots] = useState([])

  const { appointment_reference } = router.query
  const watchAll = updateAppointmentForm.watch()

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

  // fetch existing appointment
  useEffect(() => {
    if (appointment_reference) {
      fetchAppointment(appointment_reference)
    }
  }, [appointment_reference])

  // restore states of existing appointment
  useEffect(() => {
    if (appointment) {
      if (appointment.principal_name || appointment.principal_phone_number) {
        set_stage(Stage.FILL_PRINCIPAL)
      } else {
        set_stage(Stage.SELECT_SERVICE)
      }
      const serviceProduct =
        serviceProductCollection.map[appointment.service_product_reference]
      let service_insurer_tab
      if (serviceProduct.service_product_insurers.length > 0) {
        service_insurer_tab = '健保門診'
      } else {
        service_insurer_tab = '自費門診'
      }

      updateAppointmentForm.reset({
        organization_reference: ESEN_CLINIC_ORGANIZATION_UUID,
        internal_user_reference:
          appointment?.internal_user_appointment_time_slots[0]
            .internal_user_reference,
        service_insurer_tab: service_insurer_tab,
        service_product_reference: appointment.service_product_reference,
        principal_name: appointment.principal_name,
        principal_phone_number: appointment.principal_phone_number,
        cooperation_code_code: appointment?.cooperation_code_code,
      })
    }
  }, [appointment])

  // select organization / location
  useEffect(() => {
    async function fetch_service_products() {
      await emersonApiAgent.get(
        `/product/organizations/${ESEN_CLINIC_ORGANIZATION_UUID}/service_products/unexpired`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            data.forEach((sp) => serviceProductCollection.addEntity(sp))
            set_service_products(data)
          },
        }
      )
    }
    fetch_service_products()
  }, [])

  useEffect(() => {
    let s = new Set()
    service_products.forEach((sp) => {
      sp.service_product_internal_users.forEach((spiu) => {
        s.add(spiu.internal_user_reference)
        internalUserCollection.addReference(spiu.internal_user_reference)
      })
    })
    setInternalUserReferenceSet(s)
  }, [service_products])

  useEffect(() => {
    if (internalUserReferenceSet.size === 0) {
      return
    }
    updateAppointmentForm.setValue(
      'internal_user_reference',
      watchAll.internal_user_reference ||
        Array.from(internalUserReferenceSet)[0]
    )
  }, [internalUserReferenceSet])

  // select internal user
  useEffect(() => {
    if (watchAll.internal_user_reference === undefined) {
      return
    }
    updateAppointmentForm.setValue(
      'service_insurer_tab',
      watchAll.service_insurer_tab || '健保門診'
    )
  }, [watchAll.internal_user_reference])

  // select service insurer tab
  useEffect(() => {
    if (!watchAll.internal_user_reference || !watchAll.service_insurer_tab) {
      return
    }
    if (!watchAll.internal_user_reference || !watchAll.service_insurer_tab) {
      return
    }
    const availableServiceProducts = service_products
      .filter((sp) =>
        sp.service_product_internal_users.find(
          (spiu) =>
            spiu.internal_user_reference === watchAll.internal_user_reference
        )
      )
      .filter((sp) => {
        if (watchAll.service_insurer_tab === '健保門診') {
          return sp.service_product_insurers.length > 0
        } else if (watchAll.service_insurer_tab === '自費門診') {
          return sp.service_product_insurers.length === 0
        } else {
          return false
        }
      })
    set_available_service_products(availableServiceProducts)
  }, [
    service_products,
    watchAll.internal_user_reference,
    watchAll.service_insurer_tab,
  ])

  useEffect(() => {
    if (available_service_products.length === 0) {
      return
    }
    if (
      !watchAll.service_product_reference ||
      available_service_products.findIndex(
        (sp) => sp.reference === watchAll.service_product_reference
      ) === -1
    ) {
      updateAppointmentForm.setValue(
        'service_product_reference',
        available_service_products[0].reference
      )
    } else {
      updateAppointmentForm.setValue(
        'service_product_reference',
        watchAll.service_product_reference
      )
    }
  }, [available_service_products])

  useEffect(() => {
    if (!watchAll.service_product_reference) {
      return
    }
    set_active_service_product(
      available_service_products.find(
        (sp) => sp.reference === watchAll.service_product_reference
      )
    )
  }, [available_service_products, watchAll.service_product_reference])

  const handleSearchAvailableTime = async (localStartTime) => {
    track('click-search-available-time')
    setSelectedDate()
    await emersonApiAgent.get(
      `/scheduling/organizations/${ESEN_CLINIC_ORGANIZATION_UUID}/internal_user_time_slot_inventories/available`,
      {
        params: {
          internal_user_references: [watchAll.internal_user_reference],
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
            watchAll.internal_user_reference ===
            appointment.internal_user_appointment_time_slots[0]
              .internal_user_reference
          ) {
            // append time slots that were allocated to current appointment
            timeSlots.push(appointment.evaluated_time_slot)
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
            (sp) => sp.reference === watchAll.service_product_reference
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
          set_stage(Stage.SELECT_DATETIME)
        },
      }
    )
  }

  useEffect(() => {
    if (selectedDate) {
      const key = format(selectedDate, 'yyyy-MM-dd')
      setSelectableTimeSlots(selectableTimeSlotMap[key])
    }
  }, [selectedDate])

  const handleSubmitUpdateAppointmentForm = useCallback(
    async (payload) => {
      if (!appointment_reference) {
        return
      }
      track('submit-update-appointment-form')
      await emersonApiAgent.patch(
        `/scheduling/end_users/me/appointments/${appointment_reference}`,
        {
          organization_reference: payload.organization_reference,
          service_product_reference: payload.service_product_reference,
          principal_name: payload.principal_name,
          principal_phone_number: payload.principal_phone_number,
          internal_user_references: [payload.internal_user_reference],
          start_time: local_to_utc(payload.start_time),
          cooperation_code_code:
            payload?.cooperation_code_code === ''
              ? undefined
              : payload.cooperation_code_code,
        },
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (_data) => {
            router.push({
              pathname: `/appointments/${appointment_reference}`,
              query: {
                referrer: router.query.referrer,
                action: 'exit',
              },
            })
          },
        }
      )
    },
    [appointment_reference]
  )

  const handleHideCooperationCodeOffcanvas = () => {
    setTypedCooperationCodeCode('')
    setShowCooperationCodeOffcanvas(false)
  }

  return (
    <AuthPageLayout
      navbar={
        <ModalNavbar
          onBack={
            stage === Stage.FILL_PRINCIPAL
              ? false
              : () => {
                  switch (stage) {
                    case Stage.SELECT_SERVICE: {
                      track('click-previous-stage')
                      if (
                        watchAll.principal_name ||
                        watchAll.principal_phone_number
                      ) {
                        set_stage(Stage.FILL_PRINCIPAL)
                      } else {
                        set_stage(Stage.SELECT_AGENT_TYPE)
                      }
                      break
                    }
                    case Stage.SELECT_DATETIME: {
                      track('click-previous-stage')
                      set_stage(Stage.SELECT_SERVICE)
                      break
                    }
                  }
                }
          }
          title={
            {
              [Stage.FILL_PRINCIPAL]: '門診預約',
              [Stage.SELECT_SERVICE]: '修改預約',
              [Stage.SELECT_DATETIME]: '門診時段',
            }[stage]
          }
          onDismiss={() => router.replace(router.query.referrer)}
        />
      }
    >
      <Form
        onSubmit={updateAppointmentForm.handleSubmit(
          handleSubmitUpdateAppointmentForm
        )}
      >
        {stage === Stage.FILL_PRINCIPAL && (
          <Container>
            <Stack gap="m">
              <Stack gap="s">
                <Heading size="m">代理預約</Heading>
                <Text size="xs" variant="tertiary">
                  如果您的親友/小孩無法自行註冊，可以透過代理預約來幫他們在伊生診所進行診次的預約！
                </Text>
              </Stack>
              <Stack gap="m" fluid>
                <Field as={Stack} gap="xs" fluid>
                  <Label>就診人姓名</Label>
                  <Input
                    fluid
                    placeholder="輸入就診人姓名"
                    {...updateAppointmentForm.register('principal_name')}
                  />
                </Field>
                <Field as={Stack} gap="xs" fluid>
                  <Label>聯絡電話（選填）</Label>
                  <Input
                    fluid
                    placeholder="輸入聯絡電話"
                    {...updateAppointmentForm.register(
                      'principal_phone_number'
                    )}
                  />
                </Field>
                <Button
                  variant="primary"
                  inversed
                  fluid
                  onClick={() => set_stage(Stage.SELECT_SERVICE)}
                >
                  前往預約
                </Button>
              </Stack>
            </Stack>
          </Container>
        )}
        {stage === Stage.SELECT_SERVICE && (
          <Stack gap="s">
            <Container fluid>
              <Field as={Stack} gap="s" fluid>
                <Label>門診單位</Label>
                <Controller
                  control={updateAppointmentForm.control}
                  name="organization_reference"
                  render={({ field }) => (
                    <DropdownSelect
                      fluid
                      options={[
                        {
                          value: ESEN_CLINIC_ORGANIZATION_UUID,
                          label: '伊生診所（大安店）',
                        },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </Field>
            </Container>

            <Container fluid>
              <Field as={Stack} gap="s" fluid>
                <Label>選擇醫師</Label>
                <Controller
                  control={updateAppointmentForm.control}
                  name="internal_user_reference"
                  render={({ field }) => (
                    <Inline fluid gap="s">
                      {Array.from(internalUserReferenceSet).map((iur) => {
                        const internalUser = internalUserCollection.map[iur]
                        return (
                          <Card
                            key={iur}
                            centered
                            inset
                            controlScope="all"
                            active={field.value === iur}
                            onClick={() => field.onChange(iur)}
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
            </Container>

            <Container fluid>
              <Stack gap="m">
                <Field as={Stack} gap="l" fluid>
                  <Label>選擇服務</Label>
                  <Controller
                    control={updateAppointmentForm.control}
                    name="service_insurer_tab"
                    value={watchAll.service_insurer_tab}
                    render={({ field }) => (
                      <Tab type="pill" fluid>
                        {ServiceInsurerTabs.map((sit) => (
                          <Tab.Item
                            key={sit}
                            active={watchAll.service_insurer_tab === sit}
                            onClick={() => field.onChange(sit)}
                          >
                            {sit}
                          </Tab.Item>
                        ))}
                      </Tab>
                    )}
                  />
                  <Controller
                    control={updateAppointmentForm.control}
                    name="service_product_reference"
                    render={({ field }) => (
                      <DropdownSelect
                        fluid
                        options={available_service_products.map((sp) => ({
                          value: sp.reference,
                          label: sp.display_sku_key,
                        }))}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </Field>

                <Inline fluid justifyContent="space-between">
                  <Inline gap="s">
                    <Inline gap="xs">
                      <Icon name="access_time" fill={false} />
                      <Label size="xs" variant="secondary">
                        門診長度
                      </Label>
                      <Label size="xs" variant="secondary">
                        {active_service_product?.duration_in_time_slots * 5 ||
                          'N/A'}
                      </Label>
                      <Label size="xs" variant="secondary">
                        分鐘
                      </Label>
                    </Inline>
                    <Inline gap="xs">
                      <Icon name="attach_money" fill={false} />
                      <Label size="xs" variant="secondary">
                        費用
                      </Label>
                      <Label size="xs" variant="secondary">
                        {active_service_product?.registration_fee_amount}
                      </Label>
                    </Inline>
                  </Inline>

                  <Label
                    pointer
                    size="xs"
                    variant={
                      watchAll.cooperation_code_code ? 'positive' : 'info'
                    }
                    as={Inline}
                    alignItems="center"
                    gap="xs"
                    onClick={() => setShowCooperationCodeOffcanvas(true)}
                  >
                    {watchAll.cooperation_code_code && <Icon name="check" />}
                    使用合作代碼
                  </Label>
                </Inline>

                <Text size="s" variant="tertiary">
                  {active_service_product?.display_description_key}
                </Text>
              </Stack>
            </Container>

            <Container fluid>
              <Button
                type="button"
                variant="primary"
                inversed
                fluid
                onClick={() => handleSearchAvailableTime(new Date())}
                disabled={!active_service_product}
              >
                搜尋時段
              </Button>
            </Container>
          </Stack>
        )}

        {stage === Stage.SELECT_DATETIME && (
          <Stack gap="s">
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
                  track('select-date')
                  setSelectedDate(date)
                  updateAppointmentForm.setValue('start_time', null)
                }}
              />
            </Container>

            {selectedDate && (
              <Container fluid size={false}>
                <Controller
                  control={updateAppointmentForm.control}
                  name="start_time"
                  render={({ field }) => (
                    <TimeIntervalCalendar
                      title="選擇以下時段"
                      selectableTimeSlots={selectableTimeSlots}
                      isDateActive={(date) =>
                        updateAppointmentForm
                          .watch('start_time')
                          ?.getTime?.() === date.getTime()
                      }
                      isGoPrevTimeDisabled={(currentBatch, _batchOfDates) => {
                        return currentBatch === 0
                      }}
                      isGoNextTimeDisabled={(currentBatch, batchOfDates) => {
                        return (
                          batchOfDates.length === 0 ||
                          currentBatch === batchOfDates.length - 1
                        )
                      }}
                      onSelectDate={(date) => {
                        track('select-time')
                        field.onChange(date)
                      }}
                    />
                  )}
                />
              </Container>
            )}

            <Container fluid>
              <Button
                type="submit"
                variant="primary"
                inversed
                fluid
                loading={updateAppointmentForm.formState.isSubmitting}
                disabled={
                  !selectedDate || !updateAppointmentForm.watch('start_time')
                }
                onClick={updateAppointmentForm.handleSubmit(
                  handleSubmitUpdateAppointmentForm
                )}
              >
                確定更換
              </Button>
            </Container>
          </Stack>
        )}
      </Form>

      <Offcanvas
        placement="bottom"
        show={showCooperationCodeOffcanvas}
        onHide={handleHideCooperationCodeOffcanvas}
      >
        <Container>
          <Stack gap="m">
            <Inline fluid justifyContent="space-between">
              <Heading size="s">使用合作代碼</Heading>
              <Label pointer>
                <Icon
                  name="close"
                  onClick={handleHideCooperationCodeOffcanvas}
                />
              </Label>
            </Inline>
            <Stack gap="l" fluid>
              <Text size="s" variant="secondary">
                若為異業或企業合作單位，請輸入合作代碼來幫助我們驗證您的身份！
              </Text>
              <Stack gap="s" fluid>
                <input
                  type="hidden"
                  {...updateAppointmentForm.register('cooperation_code_code')}
                />
                <Input
                  fluid
                  type="text"
                  placeholder="輸入合作代碼"
                  disabled={watchAll.cooperation_code_code}
                  value={
                    watchAll.cooperation_code_code
                      ? watchAll.cooperation_code_code
                      : typedCooperationCodeCode
                  }
                  onChange={(e) => setTypedCooperationCodeCode(e.target.value)}
                />
                <Button
                  fluid
                  inversed
                  variant="primary"
                  disabled={
                    !watchAll.cooperation_code_code && !typedCooperationCodeCode
                  }
                  onClick={() => {
                    if (watchAll.cooperation_code_code) {
                      // 清空合作代碼
                      updateAppointmentForm.setValue(
                        'cooperation_code_code',
                        undefined
                      )
                    } else {
                      // 完成
                      updateAppointmentForm.setValue(
                        'cooperation_code_code',
                        typedCooperationCodeCode
                      )
                    }
                    setTypedCooperationCodeCode('')
                    setShowCooperationCodeOffcanvas(false)
                  }}
                >
                  {watchAll.cooperation_code_code ? '清空合作代碼' : '完成'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
          <Spacer ySize="m" />
        </Container>
      </Offcanvas>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default UpdateAppointmentPage