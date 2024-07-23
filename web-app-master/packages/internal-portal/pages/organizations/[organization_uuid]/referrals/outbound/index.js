import Header from '@esen/components/Header'
import UnderlineTab from '@esen/components/navigation/UnderlineTab'
import { get_full_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { addDays, format } from 'date-fns'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Stack from 'react-bootstrap/Stack'
import Table from 'react-bootstrap/Table'
import styled from 'styled-components'
import OutboundReferralBadge from '../../../../../components/badge/OutboundReferralBadge'
import OrganizationReferralPageLayout from '../../../../../components/layout/OrganizationReferralPageLayout'
import {
  REFERRAL_PROVIDER_STATE,
  REFERRAL_REFERRER_STATE,
} from '../../../../../constants/state'
import apiAgent from '../../../../../utils/apiAgent'

const StyledTr = styled.tr`
  cursor: pointer;
`

const ReferralOutboundPage = () => {
  const { organization } = useCurrentOrganization()
  const [outbound_referrals, set_outbound_referrals] = useState([])
  const { tab, setTab } = useRouterTab('轉診中')

  useEffect(() => {
    async function fetch_referrals() {
      let filter
      if (tab === '轉診中') {
        filter = {
          $or: [
            {
              $eq: ['referrer_state', REFERRAL_REFERRER_STATE.DRAFT],
            },
            {
              $eq: ['referrer_state', REFERRAL_REFERRER_STATE.SUBMITTED],
            },
            {
              $eq: ['referrer_state', REFERRAL_REFERRER_STATE.PROCESSING],
            },
          ],
        }
      } else if (tab === '轉診無效') {
        filter = {
          $or: [
            {
              $eq: ['referrer_state', REFERRAL_REFERRER_STATE.REVOKED],
            },
            {
              $eq: ['provider_state', REFERRAL_PROVIDER_STATE.REJECTED],
            },
            {
              $eq: ['provider_state', REFERRAL_PROVIDER_STATE.REVERTED],
            },
          ],
        }
      } else if (tab === '轉診逾期') {
        filter = {
          $eq: ['referrer_state', REFERRAL_REFERRER_STATE.EXPIRED],
        }
      } else if (tab === '轉診完成') {
        filter = {
          $and: [
            { $eq: ['referrer_state', REFERRAL_REFERRER_STATE.PROCESSED] },
            { $eq: ['provider_state', REFERRAL_PROVIDER_STATE.COMPLETED] },
          ],
        }
      } else if (tab === '轉診結案') {
        filter = {
          $eq: ['referrer_state', REFERRAL_REFERRER_STATE.ARCHIVED],
        }
      }
      await apiAgent.get(
        `/organizations/${organization?.uuid}/outbound_referrals`,
        {
          params: {
            filter,
          },
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_outbound_referrals(data)
          },
        }
      )
    }

    if (organization?.uuid) {
      fetch_referrals()
    }
  }, [organization?.uuid, tab])

  return (
    <OrganizationReferralPageLayout container={false}>
      <Container fluid style={{ background: '#F6F6F6' }}>
        <Stack direction="horizontal" className="pt-5 pb-3">
          <Header level={1}>轉出管理</Header>
          <Link
            passHref
            href={`/organizations/${organization?.uuid}/referrals/create`}
          >
            <Button variant="dark" className="ms-auto">
              建立轉診單
            </Button>
          </Link>
        </Stack>

        <Stack as={UnderlineTab} direction="horizontal">
          <UnderlineTab.Item
            active={tab === '轉診中'}
            onClick={() => setTab('轉診中')}
          >
            轉診中
          </UnderlineTab.Item>

          <UnderlineTab.Item
            active={tab === '轉診無效'}
            onClick={() => setTab('轉診無效')}
          >
            轉診無效
          </UnderlineTab.Item>

          <UnderlineTab.Item
            active={tab === '轉診逾期'}
            onClick={() => setTab('轉診逾期')}
          >
            轉診逾期
          </UnderlineTab.Item>

          <UnderlineTab.Item
            active={tab === '轉診完成'}
            onClick={() => setTab('轉診完成')}
          >
            轉診完成
          </UnderlineTab.Item>

          <UnderlineTab.Item
            className="ms-auto"
            active={tab === '轉診結案'}
            onClick={() => setTab('轉診結案')}
          >
            轉診結案
          </UnderlineTab.Item>
        </Stack>
      </Container>

      <Container fluid className="pt-4">
        {outbound_referrals.length === 0 ? (
          <p>沒有轉出紀錄。</p>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th>來診人姓名</th>
                <th>轉入單位</th>
                <th>負責醫師</th>
                <th>轉診原因</th>
                <th>建立轉診日期</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {outbound_referrals.map((referral) => {
                const utc_create_time = new Date(`${referral.create_time}Z`)
                const is_idle =
                  referral.referrer_state ===
                    REFERRAL_REFERRER_STATE.SUBMITTED &&
                  addDays(utc_create_time, 15) < new Date()
                return (
                  <Link
                    key={referral.uuid}
                    href={`/organizations/${organization?.uuid}/referrals/outbound/${referral.uuid}`}
                  >
                    <StyledTr>
                      <td>{get_full_name(referral.end_user)}</td>
                      <td>{referral.provider_organization.name}</td>
                      <td>{get_full_name(referral.referrer_internal_user)}</td>
                      <td>
                        <Form.Control
                          as="textarea"
                          plaintext
                          readOnly
                          value={referral.situation || 'N/A'}
                        />
                      </td>
                      <td>
                        <pre>
                          {format(new Date(referral.create_time), 'yyyy-MM-dd')}
                        </pre>
                      </td>
                      <td>
                        <OutboundReferralBadge
                          referrer_state={
                            is_idle
                              ? REFERRAL_REFERRER_STATE.IDLE
                              : referral.referrer_state
                          }
                          provider_state={referral.provider_state}
                        />
                      </td>
                    </StyledTr>
                  </Link>
                )
              })}
            </tbody>
          </Table>
        )}
      </Container>
    </OrganizationReferralPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ReferralOutboundPage
