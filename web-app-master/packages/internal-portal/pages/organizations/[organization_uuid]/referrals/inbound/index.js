import Header from '@esen/components/Header'
import UnderlineTab from '@esen/components/navigation/UnderlineTab'
import { get_full_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { format } from 'date-fns'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Stack from 'react-bootstrap/Stack'
import Table from 'react-bootstrap/Table'
import styled from 'styled-components'
import InboundReferralBadge from '../../../../../components/badge/InboundReferralBadge'
import OrganizationReferralPageLayout from '../../../../../components/layout/OrganizationReferralPageLayout'
import { REFERRAL_PROVIDER_STATE } from '../../../../../constants/state'
import apiAgent from '../../../../../utils/apiAgent'

const StyledTr = styled.tr`
  cursor: pointer;
`

const ReferralInboundPage = () => {
  const { organization } = useCurrentOrganization()
  const [inbound_referrals, set_inbound_referrals] = useState([])
  const { tab, setTab } = useRouterTab('轉診單管理')

  useEffect(() => {
    async function fetch_referrals() {
      let filter
      if (tab === '轉診單管理') {
        filter = {
          $or: [
            {
              $eq: ['provider_state', REFERRAL_PROVIDER_STATE.INCOMING],
            },
            {
              $eq: ['provider_state', REFERRAL_PROVIDER_STATE.ACCEPTED],
            },
          ],
        }
      } else if (tab === '轉診送回') {
        filter = {
          $or: [
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
          $eq: ['provider_state', REFERRAL_PROVIDER_STATE.EXPIRED],
        }
      } else if (tab === '完成轉診療程') {
        filter = {
          $eq: ['provider_state', REFERRAL_PROVIDER_STATE.COMPLETED],
        }
      } else if (tab === '轉診結案') {
        filter = {
          $eq: ['provider_state', REFERRAL_PROVIDER_STATE.ARCHIVED],
        }
      }
      await apiAgent.get(
        `/organizations/${organization?.uuid}/inbound_referrals`,
        {
          params: {
            filter,
          },
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_inbound_referrals(data)
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
        <Header level={1} className="pt-5 pb-3">
          轉入管理
        </Header>
        <Stack as={UnderlineTab} direction="horizontal">
          <UnderlineTab.Item
            active={tab === '轉診單管理'}
            onClick={() => setTab('轉診單管理')}
          >
            轉診單管理
          </UnderlineTab.Item>
          <UnderlineTab.Item
            active={tab === '轉診送回'}
            onClick={() => setTab('轉診送回')}
          >
            轉診送回
          </UnderlineTab.Item>
          <UnderlineTab.Item
            active={tab === '轉診逾期'}
            onClick={() => setTab('轉診逾期')}
          >
            轉診逾期
          </UnderlineTab.Item>
          <UnderlineTab.Item
            active={tab === '完成轉診療程'}
            onClick={() => setTab('完成轉診療程')}
          >
            完成轉診療程
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
        {inbound_referrals.length === 0 ? (
          <p>沒有轉入紀錄。</p>
        ) : (
          <Table bordered hover>
            <thead>
              <tr>
                <th>來診人姓名</th>
                <th>轉出單位</th>
                <th>轉診醫師</th>
                <th>轉診原因</th>
                <th>建立轉診日期</th>
                <th>狀態</th>
              </tr>
            </thead>
            <tbody>
              {inbound_referrals.map((referral) => (
                <Link
                  key={referral.uuid}
                  href={`/organizations/${organization?.uuid}/referrals/inbound/${referral.uuid}`}
                >
                  <StyledTr>
                    <td>{get_full_name(referral.end_user)}</td>
                    <td>{referral.referrer_organization.name}</td>
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
                      <InboundReferralBadge
                        referrer_state={referral.referrer_state}
                        provider_state={referral.provider_state}
                      />
                    </td>
                  </StyledTr>
                </Link>
              ))}
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

export default ReferralInboundPage
