import Header from '@esen/components/Header'
import Icon from '@esen/components/Icon'
import Separater from '@esen/components/Separater'
import { get_full_name, get_local_datetime } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import CloseButton from 'react-bootstrap/CloseButton'
import ListGroup from 'react-bootstrap/ListGroup'
import Modal from 'react-bootstrap/Modal'
import Stack from 'react-bootstrap/Stack'
import styled from 'styled-components'
import { StyledContainer, StyledStack } from '../../components/container/index'
import AuthLayout from '../../components/layout/AuthLayout'
import {
  StyledModalBody,
  StyledModalHeader,
  StyledModalTitle,
} from '../../components/modal/index'
import apiAgent, { icdApiAgent } from '../../utils/apiAgent'

const ESEN_CLINIC_主訴_FIELD_META_UUID = '6b196f62-b468-4061-97b2-40ac9bdb7d9b'

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
  font-size: 14px;
  line-height: 20px;
  color: #373533;
  white-space: pre-line;
`

const StyledListGroupItem = styled(ListGroup.Item)`
  cursor: pointer;
`

const VisitRetrievePage = () => {
  const router = useRouter()
  const [visit, set_visit] = useState()
  const [visit_form_records, set_visit_form_records] = useState([])
  const [icd10_code_map, set_icd10_code_map] = useState({})

  const { visit_uuid } = router.query

  useEffect(() => {
    async function fetchVisit() {
      await apiAgent.get(`/end_users/me/visits/${visit_uuid}`, {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_visit(data)
        },
      })
    }
    if (visit_uuid) {
      fetchVisit()
    }
  }, [visit_uuid])

  useEffect(() => {
    async function fetchVisitFormRecords() {
      await apiAgent.get(`/end_users/me/visits/${visit_uuid}/form_records`, {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_visit_form_records(data)
        },
      })
    }
    if (visit_uuid) {
      fetchVisitFormRecords()
    }
  }, [visit_uuid])

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

    if (visit?.assessments !== undefined) {
      visit.assessments.forEach((assess) => {
        codeSet.add(assess.icd_10_code)
      })
      if (codeSet.size > 0) {
        fetch_icd10s()
      }
    }
  }, [visit?.assessments])

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
                <StyledModalTitle>就診紀錄</StyledModalTitle>
              </span>
              <span>
                <CloseButton onClick={handleHideModal} />
              </span>
            </StyledStack>
          </StyledContainer>
        </StyledModalHeader>
        <StyledModalBody>
          <StyledContainer>
            <Header level={1} className="mb-3">
              {visit?.appointment?.organization_service?.display_name}
            </Header>
            <StyledText1 className="mb-3">
              {`${visit?.organization?.name} ${get_full_name(
                visit?.appointment?.internal_user
              )}`}
            </StyledText1>
            <StyledText2>
              {`${get_local_datetime(
                visit?.appointment?.start_time,
                'yyyy-MM-dd HH:mm'
              )} (${
                visit?.appointment?.organization_service?.duration_in_minutes ||
                'N/A'
              } mins)`}
            </StyledText2>
          </StyledContainer>

          <Separater />

          <StyledContainer>
            <Header level={2} className="mb-3">
              主訴
            </Header>
            <StyledText3>
              {visit_form_records
                .reduce((arr, fr) => [...arr, ...fr.field_records], [])
                .find(
                  (fr) =>
                    fr.field_meta_uuid === ESEN_CLINIC_主訴_FIELD_META_UUID
                )?.text_value || 'N/A'}
            </StyledText3>
          </StyledContainer>

          <Separater />

          <StyledContainer>
            <Header level={2} className="mb-3">
              診斷紀錄
            </Header>

            {visit?.assessments?.length === 0 ? (
              <StyledText3>沒有診斷紀錄。</StyledText3>
            ) : (
              <ListGroup variant="flush">
                {visit?.assessments?.map((assessment) => (
                  <Link
                    key={assessment.uuid}
                    href={{
                      pathname: `/assessments/${assessment.uuid}`,
                      query: {
                        referrer: router.asPath,
                      },
                    }}
                  >
                    <StyledListGroupItem className="px-0 py-2">
                      <Stack direction="horizontal">
                        <Header level={3}>
                          {
                            icd10_code_map[assessment.icd_10_code]
                              ?.translated_description
                          }
                        </Header>
                        <Icon name="arrow_forward_ios" className="ms-auto" />
                      </Stack>
                    </StyledListGroupItem>
                  </Link>
                ))}
              </ListGroup>
            )}
          </StyledContainer>
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

export default VisitRetrievePage
