import { genderMap } from '@esen/utils/constants/user'
import {
  get_full_name,
  get_local_datetime,
  get_user_email,
  get_user_phone,
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
import Navbar from 'react-bootstrap/Navbar'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Row from 'react-bootstrap/Row'
import styled from 'styled-components'
import AppointmentBadge from '../../../../../components/badge/AppointmentBadge'
import OrganizationReferralPageLayout from '../../../../../components/layout/OrganizationReferralPageLayout'
import {
  REFERRAL_PROVIDER_STATE,
  REFERRAL_REFERRER_STATE,
} from '../../../../../constants/state'
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

const StyledOffcanvas = styled(Offcanvas)`
  width: auto;
  min-width: 30%;
  max-width: 40%;
`

const OutboundReferralRetrievePage = () => {
  const router = useRouter()
  const { organization } = useCurrentOrganization()
  const [referral, set_referral] = useState({})
  const [referral_visits, set_referral_visits] = useState([])
  const [active_referral_visit_uuid, set_active_referral_visit_uuid] =
    useState()
  const { referral_uuid } = router.query
  const active_visit = referral_visits.find(
    (rv) => rv.uuid === active_referral_visit_uuid
  )

  useEffect(() => {
    async function fetch_organization_outbound_referral() {
      await apiAgent.get(
        `/organizations/${organization?.uuid}/outbound_referrals/${referral_uuid}`,
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
      fetch_organization_outbound_referral()
    }
  }, [organization?.uuid, referral_uuid])

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

  const handleReferralRevokeClick = async () => {
    await apiAgent.post(`/referrals/${referral.uuid}/revoke_by_referrer`, {
      onFail: (status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        router.reload()
      },
    })
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
                      value={referral.provider_organization?.name || 'N/A'}
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
                      value={organization?.name || 'N/A'}
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
                {referral.referrer_state ===
                  REFERRAL_REFERRER_STATE.SUBMITTED && (
                  <Dropdown align="end">
                    <StyledDropdownToggle variant="light">
                      轉診送出中
                    </StyledDropdownToggle>
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleReferralRevokeClick}>
                        取消轉診
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                {referral.referrer_state ===
                  REFERRAL_REFERRER_STATE.REVOKED && (
                  <StyledButton disabled variant="light">
                    轉診取消
                  </StyledButton>
                )}
                {referral.referrer_state ===
                  REFERRAL_REFERRER_STATE.EXPIRED && (
                  <StyledButton disabled variant="light">
                    轉診逾期
                  </StyledButton>
                )}
                {referral.referrer_state ===
                  REFERRAL_REFERRER_STATE.PROCESSING && (
                  <StyledButton disabled variant="light">
                    轉診受理中
                  </StyledButton>
                )}
                {referral.referrer_state ===
                  REFERRAL_REFERRER_STATE.PROCESSED && (
                  <StyledButton disabled variant="light">
                    轉診完成
                  </StyledButton>
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
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Container>

      <StyledOffcanvas
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
        </Offcanvas.Body>
      </StyledOffcanvas>
    </OrganizationReferralPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OutboundReferralRetrievePage
