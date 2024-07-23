import NestedSearchableSelect from '@esen/components/form/NestedSearchableSelect'
import Icon from '@esen/components/Icon'
import Stepper from '@esen/components/navigation/Stepper'
import { get_full_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { format } from 'date-fns'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Navbar from 'react-bootstrap/Navbar'
import Row from 'react-bootstrap/Row'
import { useForm } from 'react-hook-form'
import OrganizationReferralPageLayout from '../../../../components/layout/OrganizationReferralPageLayout'
import apiAgent from '../../../../utils/apiAgent'

const MAX_STEP = 2

const ReferralCreatePage = () => {
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const { internalUser } = useInternalUser()
  const { organization, organizationConfigMap } = useCurrentOrganization()
  const { register, setValue, watch, handleSubmit } = useForm()
  const [provider_organizations, set_provider_organizations] = useState([])
  const [end_users, set_end_users] = useState([])
  const watch_all = watch()
  const watch_provider_organization = provider_organizations.find(
    (org) => org.uuid === watch_all.provider_organization_uuid
  )
  const watch_end_user = end_users.find(
    (eu) => eu.uuid === watch_all.end_user_uuid
  )

  useEffect(() => {
    async function fetch_end_users() {
      await apiAgent.get('/end_users', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_end_users(data)
        },
      })
    }
    if (organizationConfigMap.is_end_user_management_enabled) {
      fetch_end_users()
    }
  }, [organizationConfigMap.is_end_user_management_enabled])

  useEffect(() => {
    async function fetch_organization_downstream_organizations() {
      await apiAgent.get(
        `/organizations/${organization?.uuid}/downstream_organizations`,
        {
          onSuccess: (data) => {
            set_provider_organizations(data)
          },
        }
      )
    }
    if (organization?.uuid) {
      fetch_organization_downstream_organizations()
    }
  }, [organization?.uuid])

  const handleSubmitForm = async (payload) => {
    await apiAgent.post(
      '/referrals',
      {
        ...payload,
        referrer_organization_uuid: organization?.uuid,
        referrer_internal_user_uuid: internalUser.uuid,
      },
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.push(
            `/organizations/${organization?.uuid}/referrals/outbound/${data.uuid}`
          )
        },
      }
    )
  }

  const handlePrevClick = () => {
    const nextActiveStep = Math.max(0, activeStep - 1)
    setActiveStep(nextActiveStep)
  }

  const handleNextClick = () => {
    const nextActiveStep = Math.min(MAX_STEP, activeStep + 1)
    if (activeStep === MAX_STEP) {
      handleSubmit(handleSubmitForm)()
    }
    setActiveStep(nextActiveStep)
  }

  return (
    <OrganizationReferralPageLayout>
      <Navbar>
        <Navbar.Brand>建立轉診單</Navbar.Brand>
      </Navbar>

      <Form>
        <Stepper activeStep={activeStep}>
          <Stepper.Step>
            <h4>輸入診斷 Summary</h4>
            <Stepper.StripProgress className="my-3" />
            <h5 className="mb-5">{'輸入轉診原因&背景'}</h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>選擇病患</Form.Label>
                <NestedSearchableSelect
                  title="選擇需要轉診的病患"
                  getOptions={async (query, parentOption, setOptions) => {
                    let options = end_users.map((eu) => ({
                      key: eu.uuid,
                      label: get_full_name(eu),
                      value: eu.uuid,
                      isLeaf: true,
                    }))
                    if (query) {
                      options = options.filter((opt) =>
                        opt.label.includes(query)
                      )
                    }
                    setOptions(options)
                  }}
                  onChange={(v) => setValue('end_user_uuid', v)}
                />
              </Form.Group>

              <Form.Group as={Col}>
                <Form.Label>選擇轉入單位</Form.Label>
                <Form.Select
                  {...register('provider_organization_uuid')}
                  defaultValue=""
                  disabled={provider_organizations.length === 0}
                >
                  <option disabled value="">
                    請選擇
                  </option>
                  {provider_organizations.map((organization) => (
                    <option key={organization.uuid} value={organization.uuid}>
                      {organization.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診原因</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="請解釋病患目前的狀況"
                  {...register('situation')}
                />
              </Form.Group>
            </Row>

            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>病患背景</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={8}
                  placeholder="請解釋病患過去的病史概況"
                  {...register('background')}
                />
              </Form.Group>
            </Row>
          </Stepper.Step>

          <Stepper.Step>
            <h4>輸入推薦療程</h4>
            <Stepper.StripProgress className="my-3" />
            <h5 className="mb-5">{'輸入診斷&推薦療程'}</h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>目前診斷</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  {...register('assessment')}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>醫師建議</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  {...register('recommendation')}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>建議初診日期</Form.Label>
                <Form.Control
                  type="text"
                  {...register('recommended_scheduling')}
                />
              </Form.Group>
            </Row>
          </Stepper.Step>

          <Stepper.Step>
            <h4>Review</h4>
            <Stepper.StripProgress className="my-3" />
            <h5 className="mb-5">確認資訊</h5>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診醫師</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  defaultValue={get_full_name(internalUser)}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>轉出單位</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  defaultValue={organization?.name}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>建立轉診時間</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  defaultValue={format(new Date(), 'yyyy-MM-dd')}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>轉診病患</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={watch_end_user ? get_full_name(watch_end_user) : 'N/A'}
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>轉入單位</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={
                    watch_provider_organization
                      ? watch_provider_organization.name
                      : 'N/A'
                  }
                />
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>建議初診日期</Form.Label>
                <Form.Control
                  type="text"
                  plaintext
                  readOnly
                  value={watch_all.recommended_scheduling || 'N/A'}
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
                  rows={watch_all.situation?.split('\n').length}
                  value={watch_all.situation || 'N/A'}
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
                  rows={watch_all.background?.split('\n').length}
                  value={watch_all.background || 'N/A'}
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
                  rows={watch_all.assessment?.split('\n').length}
                  value={watch_all.assessment || 'N/A'}
                />
              </Form.Group>
            </Row>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>醫師建議</Form.Label>
                <Form.Control
                  as="textarea"
                  plaintext
                  readOnly
                  rows={watch_all.recommendation?.split('\n').length}
                  value={watch_all.recommendation || 'N/A'}
                />
              </Form.Group>
            </Row>
          </Stepper.Step>
        </Stepper>
        <Stepper.Control className="pb-4">
          <Button
            variant="light"
            disabled={activeStep === 0}
            onClick={handlePrevClick}
          >
            <Icon name="arrow_back" /> 上一步
          </Button>
          <Button variant="dark" onClick={handleNextClick}>
            {activeStep === MAX_STEP ? '完成送出' : '下一步'}{' '}
            <Icon name="arrow_forward" />
          </Button>
        </Stepper.Control>
      </Form>
    </OrganizationReferralPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ReferralCreatePage
