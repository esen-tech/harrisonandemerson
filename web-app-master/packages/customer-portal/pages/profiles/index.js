import Header from '@esen/components/Header'
import Icon from '@esen/components/Icon'
import UnderlineTab from '@esen/components/navigation/UnderlineTab'
import Separater from '@esen/components/Separater'
import { get_full_name } from '@esen/utils/fn'
import { useRouterTab } from '@esen/utils/hooks/useRouterTab'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import Placeholder from 'react-bootstrap/Placeholder'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import styled from 'styled-components'
import AuthLayout from '../../components/layout/AuthLayout'
import apiAgent from '../../utils/apiAgent'

const StyledCard = styled(Card)`
  border: none;
`

const StyledCardBody = styled(Card.Body)`
  padding-left: 0px;
  padding-top: 0px;
  padding-bottom: 0px;
`

const StyledText = styled.span`
  font-size: 12px;
  color: #404040;
  align-items: center;
  display: flex;
`

const StyledNavText = styled.span`
  font-size: 14px;
  color: #171717;
  font-weight: 700;
`

const ProfileIndexPage = () => {
  const { tab, setTab } = useRouterTab('個人病歷')
  const [profile, set_profile] = useState()
  const [membership, set_membership] = useState()

  useEffect(() => {
    async function fetch_profile() {
      await apiAgent.get('/end_users/me/profiles', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_profile(data)
        },
      })
    }
    async function fetch_membership() {
      await apiAgent.get('/end_users/me/membership', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_membership(data)
        },
      })
    }
    fetch_profile()
    fetch_membership()
  }, [])

  return (
    <AuthLayout container={false}>
      <Container className="mt-3">
        <Stack>
          <StyledCard>
            <StyledCardBody>
              <Stack direction="horizontal">
                <Header level={1}>{get_full_name(profile)}</Header>
                <Icon name="arrow_forward_ios" className="ms-auto" />
              </Stack>
            </StyledCardBody>
            <Link href="/profiles/me">
              <a href="#" className="stretched-link" />
            </Link>
          </StyledCard>

          {membership ? (
            <StyledText>
              <Icon size={14} name="stars" className="me-1" />
              {membership?.is_premium ? 'ĒSEN Care Premium' : 'ĒSEN Care Free'}
            </StyledText>
          ) : (
            <Placeholder animation="glow">
              <Placeholder xs={6} />
            </Placeholder>
          )}
        </Stack>
        <UnderlineTab>
          <UnderlineTab.Item
            active={tab === '個人病歷'}
            onClick={() => setTab('個人病歷')}
          >
            個人病歷
          </UnderlineTab.Item>
          <UnderlineTab.Item
            active={tab === '身體數據'}
            onClick={() => setTab('身體數據')}
          >
            身體數據
          </UnderlineTab.Item>
        </UnderlineTab>
      </Container>
      <Separater />
      {tab === '個人病歷' && (
        <>
          {/* <Container>
            <Header level={2} className="my-3">
              醫療紀錄
            </Header>
            <StyledCard className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Image
                      src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                      width="45"
                      height="45"
                      roundedCircle
                    />
                  </Col>
                  <Col>
                    <StyledNavText>就診紀錄</StyledNavText>
                  </Col>
                  <Col xs="auto">
                    <Icon name="arrow_forward_ios" />
                  </Col>
                </Row>
              </Card.Body>
            </StyledCard>
            <StyledCard className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Image
                      src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                      width="45"
                      height="45"
                      roundedCircle
                    />
                  </Col>
                  <Col>
                    <StyledNavText>健管紀錄</StyledNavText>
                  </Col>
                  <Col xs="auto">
                    <Icon name="arrow_forward_ios" />
                  </Col>
                </Row>
              </Card.Body>
            </StyledCard>
            <StyledCard className="mb-3">
              <Card.Body>
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Image
                      src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                      width="45"
                      height="45"
                      roundedCircle
                    />
                  </Col>
                  <Col>
                    <StyledNavText>療程紀錄</StyledNavText>
                  </Col>
                  <Col xs="auto">
                    <Icon name="arrow_forward_ios" />
                  </Col>
                </Row>
              </Card.Body>
            </StyledCard>
          </Container>
          <Separater /> */}
          <Container>
            <Header level={2} className="my-3">
              病史{'&'}生活習慣
            </Header>
            <Stack gap={3} className="pb-3">
              <Card>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <Image
                        src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                        width="45"
                        height="45"
                        roundedCircle
                      />
                    </Col>
                    <Col>
                      <StyledNavText>就診初診單</StyledNavText>
                    </Col>
                    <Col xs="auto">
                      <Icon name="arrow_forward_ios" />
                    </Col>
                  </Row>
                </Card.Body>
                <Link href="/onboarding">
                  <a href="#" className="stretched-link" />
                </Link>
              </Card>
              {/* <Card>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <Image
                        src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                        width="45"
                        height="45"
                        roundedCircle
                      />
                    </Col>
                    <Col>
                      <StyledNavText>家族病史</StyledNavText>
                    </Col>
                    <Col xs="auto">
                      <Icon name="arrow_forward_ios" />
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
              <Card>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col xs="auto">
                      <Image
                        src="https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png"
                        width="45"
                        height="45"
                        roundedCircle
                      />
                    </Col>
                    <Col>
                      <StyledNavText>生活習慣</StyledNavText>
                    </Col>
                    <Col xs="auto">
                      <Icon name="arrow_forward_ios" />
                    </Col>
                  </Row>
                </Card.Body>
              </Card> */}
            </Stack>
          </Container>
        </>
      )}
      {tab === '身體數據' && (
        <Container className="py-3">
          <p>尚無身體數據。</p>
        </Container>
      )}
    </AuthLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ProfileIndexPage
