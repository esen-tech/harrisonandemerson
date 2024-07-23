import Icon from '@esen/components/Icon'
import { APPOINTMENT_STATE } from '@esen/utils/constants/state'
import { genderMap } from '@esen/utils/constants/user'
import {
  get_full_name,
  get_local_datetime,
  get_user_email,
  get_user_phone,
  local_to_utc,
} from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { format, subMinutes } from 'date-fns'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import AppointmentBadge from '../../../../../components/badge/AppointmentBadge'
import OrganizationReferralPageLayout from '../../../../../components/layout/OrganizationReferralPageLayout'
import Offcanvas from '../../../../../components/Offcanvas'
import { REFERRAL_PROVIDER_STATE } from '../../../../../constants/state'
import apiAgent from '../../../../../utils/apiAgent'

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  width: 100%;
`

const StyledButton = styled(Button)`
  width: 100%;
`

const StyledCard = styled(Card)`
  cursor: pointer;
`

const InboundReferralRetrievePage = () => {
  const router = useRouter()
  const { organization } = useCurrentOrganization()
  const createReferralVisitForm = useForm()
  const updateVisitForm = useForm()
  const updateAppointmentForm = useForm()
  const [referral, set_referral] = useState({})
  const [referral_visits, set_referral_visits] = useState([])
  const [active_referral_visit_uuid, set_active_referral_visit_uuid] =
    useState()
  const [editing_referral_visit_uuid, set_editing_referral_visit_uuid] =
    useState()
  const [
    show_create_referral_visit_offcanvas,
    set_show_create_referral_visit_offcanvas,
  ] = useState(false)
  const [organization_internal_users, set_organization_internal_users] =
    useState([])
  const { referral_uuid } = router.query
  const active_visit = referral_visits.find(
    (rv) => rv.uuid === active_referral_visit_uuid
  )
  const editing_visit = referral_visits.find(
    (rv) => rv.uuid === editing_referral_visit_uuid
  )

  useEffect(() => {
    async function fetch_organization_inbound_referrals() {
      await apiAgent.get(
        `/organizations/${organization?.uuid}/inbound_referrals/${referral_uuid}`,
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_referral(data)
          },
        }
      )
    }
    if (organization?.uuid && referral_uuid) {
      fetch_organization_inbound_referrals()
    }
  }, [organization?.uuid, referral_uuid])

  const handleReferralAcceptClick = async () => {
    await apiAgent.post(
      `/referrals/${referral.uuid}/accept_by_provider`,
      null,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  const handleReferralRejectClick = async () => {
    await apiAgent.post(
      `/referrals/${referral.uuid}/reject_by_provider`,
      null,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  const handleAppointmentEventAbsent = async (appointment_uuid) => {
    await apiAgent.post(`/appointments/${appointment_uuid}/absent`, null, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
  }

  const handleAppointmentEventCancel = async (appointment_uuid) => {
    await apiAgent.post(`/appointments/${appointment_uuid}/cancel`, null, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
  }

  const handleAppointmentEventComplete = async (appointment_uuid) => {
    await apiAgent.post(`/appointments/${appointment_uuid}/complete`, null, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
  }

  const handleSubmitCreateReferralVisitForm = async (payload) => {
    payload = {
      organization_uuid: organization?.uuid,
      end_user_uuid: referral.end_user.uuid,
      referral_uuid,
      appointment: {
        ...payload.appointment,
        start_time: local_to_utc(payload.appointment.start_time),
      },
    }
    await apiAgent.post(`/referrals/${referral_uuid}/visits`, payload, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
  }

  const handleSubmitUpdateAppointmentForm = async (payload) => {
    payload = {
      ...payload,
      start_time: local_to_utc(payload.start_time),
    }
    await apiAgent.patch(
      `/appointments/${editing_visit.appointment.uuid}`,
      payload,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  const handleSubmitUpdateVisitForm = async (payload) => {
    await apiAgent.patch(`/visits/${active_visit.uuid}`, payload, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
  }

  useEffect(() => {
    async function fetch_referral_visits() {
      await apiAgent.get(`/referrals/${referral_uuid}/visits`, {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_referral_visits(data)
        },
      })
    }
    if (referral_uuid) {
      fetch_referral_visits()
    }
  }, [referral_uuid])

  useEffect(() => {
    async function fetch_organization_internal_users() {
      await apiAgent.get(
        `/organizations/${organization?.uuid}/internal_users`,
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_organization_internal_users(data)
          },
        }
      )
    }
    if (organization?.uuid) {
      fetch_organization_internal_users()
    }
  }, [organization?.uuid])

  const handleReferralRevertClick = async () => {
    await apiAgent.post(
      `/referrals/${referral.uuid}/revert_by_provider`,
      null,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  const handleReferralCompleteClick = async () => {
    await apiAgent.post(
      `/referrals/${referral.uuid}/complete_by_provider`,
      null,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  return (
    <OrganizationReferralPageLayout container={false}>
      <Container fluid style={{ background: '#F6F6F6' }}>
        <Navbar className="pt-5 pb-3">
          <Navbar.Brand>查看轉診</Navbar.Brand>
        </Navbar>
      </Container>

      <Container fluid>
        <Row>
          <Col xs={7}>
            <Row className="mt-5">
              <h5>轉診單內容</h5>
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>轉診病患</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={
                        referral.end_user
                          ? get_full_name(referral.end_user)
                          : 'N/A'
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>轉入單位</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={organization?.name || 'N/A'}
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>建議初診日期</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={referral.recommended_scheduling || 'N/A'}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>病患聯絡電話</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={get_user_phone(referral.end_user?.end_user_phones)}
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>病患 Email</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={get_user_email(referral.end_user?.end_user_emails)}
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>病患性別</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={genderMap[referral.end_user?.gender]}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>轉診原因</Form.Label>
                    <Form.Control
                      as="textarea"
                      plaintext
                      readOnly
                      rows={referral.situation?.split('\n').length}
                      value={referral.situation || 'N/A'}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>病患背景</Form.Label>
                    <Form.Control
                      as="textarea"
                      plaintext
                      readOnly
                      rows={referral.background?.split('\n').length}
                      value={referral.background || 'N/A'}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>目前診斷</Form.Label>
                    <Form.Control
                      as="textarea"
                      plaintext
                      readOnly
                      rows={referral.assessment?.split('\n').length}
                      value={referral.assessment || 'N/A'}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>轉診醫師建議</Form.Label>
                    <Form.Control
                      as="textarea"
                      plaintext
                      readOnly
                      rows={referral.recommendation?.split('\n').length}
                      value={referral.recommendation || 'N/A'}
                    />
                  </Form.Group>
                </Row>
              </Form>
            </Row>

            <Row className="mt-5">
              <h5>轉出單位</h5>
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>轉診醫師</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={
                        referral.referrer_internal_user
                          ? get_full_name(referral.referrer_internal_user)
                          : 'N/A'
                      }
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>轉出單位</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={referral.referrer_organization?.name || 'N/A'}
                    />
                  </Form.Group>
                  <Form.Group as={Col}>
                    <Form.Label>轉診日期</Form.Label>
                    <Form.Control
                      type="text"
                      plaintext
                      readOnly
                      value={
                        referral.create_time
                          ? format(new Date(referral.create_time), 'yyyy-MM-dd')
                          : 'N/A'
                      }
                    />
                  </Form.Group>
                </Row>
              </Form>
            </Row>
          </Col>

          <Col xs={5}>
            <Row className="mt-5">
              <Col>
                <h5>轉診單狀態</h5>
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.EXPIRED && (
                  <StyledButton disabled variant="light">
                    轉診逾期
                  </StyledButton>
                )}
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.INCOMING && (
                  <Nav justify>
                    <Nav.Item className="d-grid p-1">
                      <Button
                        variant="light"
                        onClick={handleReferralRejectClick}
                      >
                        取消轉診
                      </Button>
                    </Nav.Item>
                    <Nav.Item className="d-grid p-1">
                      <Button
                        variant="dark"
                        onClick={handleReferralAcceptClick}
                      >
                        接受轉診
                      </Button>
                    </Nav.Item>
                  </Nav>
                )}
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.ACCEPTED && (
                  <Dropdown align="end">
                    <StyledDropdownToggle variant="light">
                      轉診受理中
                    </StyledDropdownToggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleReferralRevertClick}>
                        中斷轉診
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleReferralCompleteClick}>
                        完成轉診
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.REJECTED && (
                  <StyledButton disabled variant="light">
                    轉診拒絕
                  </StyledButton>
                )}
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.REVERTED && (
                  <StyledButton disabled variant="light">
                    轉診中斷
                  </StyledButton>
                )}
                {referral.provider_state ===
                  REFERRAL_PROVIDER_STATE.COMPLETED && (
                  <StyledButton disabled variant="light">
                    轉診完成
                  </StyledButton>
                )}
              </Col>
            </Row>
            {[
              REFERRAL_PROVIDER_STATE.INCOMING,
              REFERRAL_PROVIDER_STATE.ACCEPTED,
              REFERRAL_PROVIDER_STATE.COMPLETED,
              REFERRAL_PROVIDER_STATE.REVERTED,
            ].includes(referral.provider_state) && (
              <Row className="mt-5">
                <Col className="d-grid">
                  <h5>轉診預約</h5>
                  {referral_visits.length === 0 ? (
                    <p className="text-center p-3">尚無任何相關預約喔！</p>
                  ) : (
                    referral_visits.map((visit) => (
                      <StyledCard
                        key={visit.uuid}
                        className="mb-2"
                        onClick={() =>
                          set_active_referral_visit_uuid(visit.uuid)
                        }
                      >
                        <Card.Body>
                          <Row>
                            <Col xs={8}>
                              <div style={{ color: '#9D9C9A' }}>
                                {get_full_name(visit.appointment.end_user)}
                              </div>
                              <div style={{ color: '#4D4A47' }}>
                                {format(
                                  subMinutes(
                                    new Date(visit.appointment.start_time),
                                    new Date().getTimezoneOffset()
                                  ),
                                  'yyyy-MM-dd HH:mm'
                                )}
                              </div>
                              <div style={{ color: '#9D9C9A' }}>
                                {get_full_name(visit.appointment.internal_user)}
                              </div>
                            </Col>
                            <Col xs={4} style={{ textAlign: 'right' }}>
                              <AppointmentBadge
                                state={visit.appointment.state}
                              />
                            </Col>
                          </Row>
                        </Card.Body>
                      </StyledCard>
                    ))
                  )}
                  {[
                    REFERRAL_PROVIDER_STATE.INCOMING,
                    REFERRAL_PROVIDER_STATE.ACCEPTED,
                  ].includes(referral.provider_state) && (
                    <Button
                      variant="dark"
                      disabled={
                        referral.provider_state !==
                        REFERRAL_PROVIDER_STATE.ACCEPTED
                      }
                      onClick={() =>
                        set_show_create_referral_visit_offcanvas(true)
                      }
                    >
                      建立預約
                    </Button>
                  )}
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <Offcanvas
        scroll
        backdrop
        placement="end"
        show={active_referral_visit_uuid !== undefined}
        onHide={() => set_active_referral_visit_uuid(undefined)}
      >
        <Offcanvas.Header>
          <Offcanvas.Title>預約診次</Offcanvas.Title>
          <AppointmentBadge state={active_visit?.appointment.state} />
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診病患</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_full_name(active_visit?.appointment.end_user)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>病患聯絡電話</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_phone(referral.end_user?.end_user_phones)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>病患 Email</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_email(referral.end_user?.end_user_emails)}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>預約時段</Form.Label>
                <Form.Control
                  type="datetime-local"
                  plaintext
                  readOnly
                  value={get_local_datetime(
                    active_visit?.appointment.start_time
                  )}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>負責醫師</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_full_name(active_visit?.appointment.internal_user)}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>備註</Form.Label>
                <Form.Control
                  as="textarea"
                  plaintext
                  readOnly
                  rows={
                    active_visit?.appointment.description?.split('\n').length
                  }
                  value={active_visit?.appointment.description || 'N/A'}
                />
              </Form.Group>
            </Row>
            {active_visit?.referral_feedback && (
              <Row className="mb-3">
                <Form.Group as={Col}>
                  <Form.Label>轉診回報</Form.Label>
                  <Form.Control
                    as="textarea"
                    plaintext
                    readOnly
                    rows={active_visit?.referral_feedback?.split('\n').length}
                    value={active_visit?.referral_feedback || 'N/A'}
                  />
                </Form.Group>
              </Row>
            )}
          </Form>

          {active_visit?.appointment.state === APPOINTMENT_STATE.SCHEDULED && (
            <div className="d-grid p-1">
              <Button
                variant="light"
                onClick={() => {
                  set_active_referral_visit_uuid(undefined)
                  set_editing_referral_visit_uuid(active_visit?.uuid)
                }}
              >
                <Icon name="edit" /> 修改預約時段資訊
              </Button>
            </div>
          )}
          {active_visit?.appointment.state === APPOINTMENT_STATE.SCHEDULED && (
            <Nav justify>
              <Nav.Item className="d-grid p-1">
                <Button
                  variant="danger"
                  onClick={() =>
                    handleAppointmentEventAbsent(active_visit?.appointment.uuid)
                  }
                >
                  無故缺席
                </Button>
              </Nav.Item>
              <Nav.Item className="d-grid p-1">
                <Button
                  variant="light"
                  onClick={() =>
                    handleAppointmentEventCancel(active_visit?.appointment.uuid)
                  }
                >
                  取消預約
                </Button>
              </Nav.Item>
              <Nav.Item className="d-grid p-1">
                <Button
                  variant="dark"
                  onClick={() =>
                    handleAppointmentEventComplete(
                      active_visit?.appointment.uuid
                    )
                  }
                >
                  完成就診
                </Button>
              </Nav.Item>
            </Nav>
          )}
          {active_visit?.appointment.state === APPOINTMENT_STATE.COMPLETED &&
            !active_visit?.referral_feedback && (
              <Form>
                <Row className="mb-3">
                  <Form.Group as={Col}>
                    <Form.Label>轉診回報</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={5}
                      placeholder="紀錄病患轉診內容來協助轉診醫師了解後續的來診狀況"
                      {...updateVisitForm.register('referral_feedback')}
                    />
                  </Form.Group>
                </Row>
                <Row className="mb-3">
                  <Form.Group as={Col} className="d-grid">
                    <Button
                      variant="dark"
                      onClick={updateVisitForm.handleSubmit(
                        handleSubmitUpdateVisitForm
                      )}
                    >
                      完成紀錄
                    </Button>
                  </Form.Group>
                </Row>
              </Form>
            )}
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        scroll
        backdrop
        placement="end"
        show={show_create_referral_visit_offcanvas}
        onHide={() => set_show_create_referral_visit_offcanvas(false)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>預約診次</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診病患</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={
                    referral.end_user ? get_full_name(referral.end_user) : 'N/A'
                  }
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>病患聯絡電話</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_phone(referral.end_user?.end_user_phones)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>病患 Email</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_email(referral.end_user?.end_user_emails)}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>預約時段</Form.Label>
                <Form.Control
                  type="datetime-local"
                  {...createReferralVisitForm.register(
                    'appointment.start_time'
                  )}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>負責醫師</Form.Label>
                <Form.Select
                  defaultValue=""
                  {...createReferralVisitForm.register(
                    'appointment.internal_user_uuid'
                  )}
                >
                  <option disabled value="">
                    請選擇
                  </option>
                  {organization_internal_users.map((oiu) => (
                    <option key={oiu.uuid} value={oiu.uuid}>
                      {get_full_name(oiu)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>備註</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  {...createReferralVisitForm.register(
                    'appointment.description'
                  )}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} className="d-grid">
                <Button
                  variant="dark"
                  onClick={createReferralVisitForm.handleSubmit(
                    handleSubmitCreateReferralVisitForm
                  )}
                >
                  建立
                </Button>
              </Form.Group>
            </Row>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        scroll
        backdrop
        placement="end"
        show={editing_referral_visit_uuid !== undefined}
        onHide={() => set_editing_referral_visit_uuid(undefined)}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>預約診次</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診病患</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={
                    referral.end_user ? get_full_name(referral.end_user) : 'N/A'
                  }
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>病患聯絡電話</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_phone(referral.end_user?.end_user_phones)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>病患 Email</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={get_user_email(referral.end_user?.end_user_emails)}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>預約時段</Form.Label>
                <Form.Control
                  type="datetime-local"
                  defaultValue={get_local_datetime(
                    editing_visit?.appointment.start_time
                  )}
                  {...updateAppointmentForm.register('start_time')}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>負責醫師</Form.Label>
                <Form.Select
                  defaultValue={editing_visit?.appointment.internal_user.uuid}
                  {...updateAppointmentForm.register('internal_user_uuid')}
                >
                  {organization_internal_users.map((oiu) => (
                    <option key={oiu.uuid} value={oiu.uuid}>
                      {get_full_name(oiu)}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>備註</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  defaultValue={editing_visit?.appointment.description}
                  {...updateAppointmentForm.register('description')}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col} className="d-grid">
                <Button
                  variant="dark"
                  onClick={updateAppointmentForm.handleSubmit(
                    handleSubmitUpdateAppointmentForm
                  )}
                >
                  完成修改預約
                </Button>
              </Form.Group>
            </Row>
          </Form>
        </Offcanvas.Body>
      </Offcanvas>
    </OrganizationReferralPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default InboundReferralRetrievePage
