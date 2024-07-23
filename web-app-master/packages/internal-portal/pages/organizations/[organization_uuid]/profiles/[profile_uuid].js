import Icon from '@esen/components/Icon'
import UnderlineTab from '@esen/components/navigation/UnderlineTab'
import { genderMap } from '@esen/utils/constants/user'
import { get_full_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import differenceInYears from 'date-fns/differenceInYears'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Container from 'react-bootstrap/Container'
import styled from 'styled-components'
import OrganizationProfilePageLayout from '../../../../components/layout/OrganizationProfilePageLayout'
import ExamineReport from '../../../../components/profile/ExamineReport'
import ProfilePanel from '../../../../components/profile/ProfilePanel'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const StyledUl = styled.ul`
  list-style-type: none;
  margin: 9px 0;
  padding: 0;

  li {
    display: inline-block;
    color: #9d9c9a;
    margin-right: 18px;
  }
`

const ProfileRetrievePage = () => {
  const router = useRouter()
  const { organization } = useCurrentOrganization()
  const { tab, setTab } = useRouterTab('檢測報告')
  const [end_user, set_end_user] = useState()
  const { profile_uuid } = router.query

  useEffect(() => {
    async function fetch_end_user() {
      await harrisonApiAgent.get(
        `/iam/organizations/${organization.reference}/end_users/${profile_uuid}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_end_user(data)
          },
        }
      )
    }
    if (organization) {
      fetch_end_user()
    }
  }, [organization, tab])

  return (
    <OrganizationProfilePageLayout container={false}>
      <Container fluid style={{ background: '#F6F6F6' }}>
        {end_user && (
          <div className="pt-4 pb-2">
            <h3 className="pb-2">{get_full_name(end_user)}</h3>
            <StyledUl>
              {end_user.birth_date && (
                <li>
                  {`${end_user.birth_date} (${differenceInYears(
                    new Date(),
                    new Date(end_user.birth_date)
                  )})`}
                </li>
              )}
              {end_user.gender && <li>{genderMap[end_user.gender]}</li>}
              {end_user.tw_identity_card_number && (
                <li>{end_user.tw_identity_card_number}</li>
              )}
            </StyledUl>
            <StyledUl>
              <li>
                <Icon name="local_phone" /> {end_user.phone_number || 'N/A'}
              </li>
              <li>
                <Icon name="email" /> {end_user.email_address || 'N/A'}
              </li>
            </StyledUl>
          </div>
        )}
        <UnderlineTab>
          <UnderlineTab.Item
            active={tab === '個人病歷'}
            onClick={() => setTab('個人病歷')}
          >
            個人病歷
          </UnderlineTab.Item>
          <UnderlineTab.Item
            active={tab === '檢測報告'}
            onClick={() => setTab('檢測報告')}
          >
            檢測報告
          </UnderlineTab.Item>
        </UnderlineTab>
      </Container>
      {tab === '個人病歷' && <ProfilePanel endUserUUID={profile_uuid} />}
      {tab === '檢測報告' && <ExamineReport endUserReference={profile_uuid} />}
    </OrganizationProfilePageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ProfileRetrievePage
