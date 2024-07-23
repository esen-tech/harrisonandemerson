import Header from '@esen/components/Header'
import Icon from '@esen/components/Icon'
import { get_full_name } from '@esen/utils/fn'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { forwardRef, useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import Image from 'react-bootstrap/Image'
import Offcanvas from 'react-bootstrap/Offcanvas'
import Row from 'react-bootstrap/Row'
import Stack from 'react-bootstrap/Stack'
import styled, { css } from 'styled-components'

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const StyledDiv = styled.div`
  cursor: pointer;
`

const StyledOffcanvas = styled(Offcanvas)`
  max-width: 254px;
`

const StyledContainer = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const StyledLeft = styled.div`
  flex-basis: fit-content;
`
const StyledMiddle = styled.div``

const StyledRight = styled.div`
  flex-basis: fit-content;
`

const StyledStack = styled(Stack)`
  height: 100%;
`

const StyledMenuItem = styled.div`
  font-weight: 700;
  font-size: 14px;
  font-weight: 700;
  line-height: 20px;
  cursor: pointer;

  ${(props) => {
    if (props.$sticky === 'bottom') {
      return css`
        position: absolute;
        bottom: 0px;
      `
    }
  }}
`

const StyledText = styled.div`
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;
  vertical-align: middle;
  color: #737373;
`

const DropdownToggle = forwardRef(({ onClick }, ref) => (
  <StyledIcon
    name="more_horiz"
    ref={ref}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  />
))

const TopNavigation = ({ backHref, title, action }) => {
  const router = useRouter()
  const { endUser } = useEndUser()
  const [showTopNavigationOffcanvas, setShowTopNavigationOffcanvas] =
    useState(false)

  return (
    <>
      <StyledContainer fluid className="mb-3 py-2">
        <StyledLeft>
          {backHref ? (
            <Link href={backHref}>
              <Icon name="arrow_back" />
            </Link>
          ) : (
            <StyledIcon
              name="menu"
              onClick={() => setShowTopNavigationOffcanvas(true)}
              className="justify-content-between"
            />
          )}
        </StyledLeft>
        <StyledMiddle>
          <Header level={2}>
            {title ? (
              title
            ) : (
              <Link href="/">
                <StyledDiv>
                  <Image src="/logo-with-text.png" height="24" />
                </StyledDiv>
              </Link>
            )}
          </Header>
        </StyledMiddle>
        <StyledRight>
          {action ? (
            action
          ) : (
            <Dropdown align="end">
              <Dropdown.Toggle as={DropdownToggle} />
              <Dropdown.Menu>
                <Dropdown.Item disabled>尚無更多選項</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </StyledRight>
      </StyledContainer>

      <StyledOffcanvas
        show={showTopNavigationOffcanvas}
        onHide={() => setShowTopNavigationOffcanvas(false)}
      >
        <Offcanvas.Body className="p-3">
          <StyledStack gap={4}>
            <Link href="/profiles">
              <StyledMenuItem
                onClick={() => setShowTopNavigationOffcanvas(false)}
              >
                <Header level={2} className="mb-1">
                  {get_full_name(endUser)}
                </Header>
                <StyledText>查看個人病歷</StyledText>
              </StyledMenuItem>
            </Link>

            <StyledMenuItem
              onClick={() => setShowTopNavigationOffcanvas(false)}
            >
              <Link
                href={{
                  pathname: '/appointments/create',
                  query: { referrer: router.asPath },
                }}
              >
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Icon name="calendar_month" />
                  </Col>
                  <Col>門診預約</Col>
                </Row>
              </Link>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() => setShowTopNavigationOffcanvas(false)}
            >
              <Link href="/appointments">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Icon name="fact_check" />
                  </Col>
                  <Col>診次紀錄</Col>
                </Row>
              </Link>
            </StyledMenuItem>

            <StyledMenuItem
              onClick={() => setShowTopNavigationOffcanvas(false)}
            >
              <Link href="/examination-reports">
                <Row className="align-items-center">
                  <Col xs="auto">
                    <Icon name="science" />
                  </Col>
                  <Col>檢驗報告</Col>
                </Row>
              </Link>
            </StyledMenuItem>

            <StyledMenuItem
              className="mt-auto"
              onClick={() => setShowTopNavigationOffcanvas(false)}
            >
              <div className="mb-1">
                <Link href="https://lin.ee/SvLRsWD" passHref>
                  <a
                    target="_blank"
                    rel="noopener"
                    style={{
                      color: 'inherit',
                      textDecoration: 'inherit',
                    }}
                  >
                    <Icon fill={0} size={20} name="help_outline" /> 聯絡客服
                  </a>
                </Link>
              </div>
              <StyledText>© ĒSEN Medical. All rights reserved.</StyledText>
            </StyledMenuItem>
          </StyledStack>
        </Offcanvas.Body>
      </StyledOffcanvas>
    </>
  )
}

export default TopNavigation
