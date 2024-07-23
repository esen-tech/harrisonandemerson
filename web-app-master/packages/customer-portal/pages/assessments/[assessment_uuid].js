import Badge from '@esen/components/Badge'
import Header from '@esen/components/Header'
import Separater from '@esen/components/Separater'
import { get_full_name, get_local_datetime } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CloseButton from 'react-bootstrap/CloseButton'
import Modal from 'react-bootstrap/Modal'
import Stack from 'react-bootstrap/Stack'
import styled from 'styled-components'
import AppointmentSummary from '../../components/appointment/AppointmentSummary'
import { StyledContainer, StyledStack } from '../../components/container/index'
import AuthLayout from '../../components/layout/AuthLayout'
import {
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
} from '../../components/modal/index'
import apiAgent, { icdApiAgent } from '../../utils/apiAgent'

const StyledText1 = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #737373;
`

const StyledText2 = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  color: #373533;
`

const StyledText3 = styled.div`
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #716e6c;
  white-space: pre-line;
`

const AssessmentRetrievePage = () => {
  const router = useRouter()
  const [assessment, set_assessment] = useState()
  const [icd10_code_map, set_icd10_code_map] = useState({})

  const { assessment_uuid } = router.query

  useEffect(() => {
    async function fetchAssessment() {
      await apiAgent.get(`/end_users/me/assessments/${assessment_uuid}`, {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_assessment(data)
        },
      })
    }
    if (assessment_uuid) {
      fetchAssessment()
    }
  }, [assessment_uuid])

  useEffect(() => {
    let codeSet = new Set()

    async function fetch_icd10s() {
      await icdApiAgent.get('/icd10s', {
        params: {
          query: {
            codes: Array.from(codeSet),
          },
        },
        onError: null,
        onSuccess: (data) => {
          const codeMap = data.reduce(
            (m, icd10) => ({ ...m, [icd10.code]: icd10 }),
            {}
          )
          set_icd10_code_map(codeMap)
        },
      })
    }

    if (assessment !== undefined) {
      codeSet.add(assessment.icd_10_code)
      if (codeSet.size > 0) {
        fetch_icd10s()
      }
    }
  }, [assessment])

  const handleHideModal = () => {
    router.push(router.query.referrer)
  }

  return (
    <AuthLayout>
      <Modal
        show
        fullscreen="sm-down"
        scrollable
        onHide={handleHideModal}
        animation={false}
      >
        <StyledModalHeader>
          <StyledContainer>
            <StyledStack direction="horizontal">
              <span></span>
              <span>
                <StyledModalTitle>診斷紀錄</StyledModalTitle>
              </span>
              <span>
                <CloseButton onClick={handleHideModal} />
              </span>
            </StyledStack>
          </StyledContainer>
        </StyledModalHeader>
        <StyledModalBody>
          <StyledContainer>
            <Stack direction="horizontal" className="mb-2">
              <Badge variant="light" className="me-2">
                ICD-10
              </Badge>
              <StyledText1>{assessment?.icd_10_code}</StyledText1>
            </Stack>

            <Header level={1} className="mb-3">
              {icd10_code_map[assessment?.icd_10_code]?.translated_description}
            </Header>
            <StyledText1 className="mb-3">
              {`${assessment?.visit?.organization?.name} ${get_full_name(
                assessment?.visit?.appointment?.internal_user
              )}`}
            </StyledText1>
            <StyledText2>
              {`${get_local_datetime(
                assessment?.visit?.appointment?.start_time,
                'yyyy-MM-dd HH:mm'
              )} (${
                assessment?.visit?.appointment?.organization_service
                  ?.duration_in_minutes || 'N/A'
              } mins)`}
            </StyledText2>
          </StyledContainer>

          <Separater />

          <StyledContainer>
            <Header level={2} className="mb-3">
              醫師評估筆記
            </Header>
            <StyledText3>{assessment?.remark || 'N/A'}</StyledText3>
          </StyledContainer>

          {assessment?.visit?.appointment && (
            <>
              <Separater />

              <StyledContainer>
                <Header level={2} className="mb-3">
                  就醫診次
                </Header>
                <AppointmentSummary
                  appointment={assessment.visit.appointment}
                  onClick={() => {
                    router.push({
                      pathname: `/appointments/${assessment.visit.appointment.uuid}`,
                      query: {
                        referrer: router.asPath,
                      },
                    })
                  }}
                />
              </StyledContainer>
            </>
          )}
        </StyledModalBody>
      </Modal>
    </AuthLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default AssessmentRetrievePage
