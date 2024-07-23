import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Flex from '@esen/essence/components/Flex'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Offcanvas from '@esen/essence/components/Offcanvas'
import Stack from '@esen/essence/components/Stack'
import { get_full_name } from '@esen/utils/fn'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import styled from 'styled-components'
import Logo from '../brand/Logo'

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const StyledLabel = styled(Label)`
  word-break: break-all;
  white-space: normal;
`

const StyledOffcanvas = styled(Offcanvas)`
  min-width: 254px;
`

const Navbar = ({ leftAction, title, rightAction, ...rest }) => {
  const router = useRouter()
  const { endUser } = useEndUser()
  const [showOffcanvas, setShowOffcanvas] = useState(false)

  return (
    <Container fluid squished {...rest}>
      <Inline alignItems="center">
        <Flex grow={1}>
          {leftAction !== false &&
            (leftAction ? (
              leftAction
            ) : (
              <StyledIcon
                name="menu"
                sizeInPixel={24}
                onClick={() => setShowOffcanvas(true)}
              />
            ))}
        </Flex>
        <Flex grow={1} justifyContent="center">
          {title ? (
            <StyledLabel size="l">{title}</StyledLabel>
          ) : (
            <Link href="/">
              <Logo text style={{ cursor: 'pointer' }} />
            </Link>
          )}
        </Flex>
        <Flex grow={1} justifyContent="end">
          {rightAction !== false &&
            (rightAction ? (
              rightAction
            ) : (
              <Label disabled>
                <StyledIcon name="more_horiz" sizeInPixel={24} />
              </Label>
            ))}
        </Flex>
      </Inline>
      <StyledOffcanvas
        backdrop
        placement="left"
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
      >
        <Stack fluid fill justifyContent="space-between">
          <Stack fluid>
            <Stack fluid>
              <Container fluid>
                <Logo text />
              </Container>
              {/* <Link href="/profiles"> */}
              <Link href="/profiles/me">
                <ListItem
                  controlScope="all"
                  onClick={() => setShowOffcanvas(false)}
                >
                  <ListItem.Content
                    title={get_full_name(endUser)}
                    paragraph="編輯個人檔案"
                  />
                </ListItem>
              </Link>
            </Stack>

            <Divider indention="y" />

            <Stack fluid>
              <Link
                replace
                href={{
                  pathname: '/appointments/create',
                  query: { referrer: router.asPath },
                }}
              >
                <ListItem
                  verticallyCentered
                  controlScope="all"
                  onClick={() => setShowOffcanvas(false)}
                >
                  <ListItem.Content title="門診預約" />
                </ListItem>
              </Link>
              <Link href="/appointments">
                <ListItem
                  verticallyCentered
                  controlScope="all"
                  onClick={() => setShowOffcanvas(false)}
                >
                  <ListItem.Content title="診次紀錄" />
                </ListItem>
              </Link>
              <Link href="/examination-reports">
                <ListItem
                  verticallyCentered
                  controlScope="all"
                  onClick={() => setShowOffcanvas(false)}
                >
                  <ListItem.Content title="檢驗報告" />
                </ListItem>
              </Link>
            </Stack>

            <Divider indention="left" />

            <Stack fluid>
              <Link href="https://lin.ee/SvLRsWD" passHref>
                <a
                  target="_blank"
                  rel="noopener"
                  style={{
                    color: 'inherit',
                    textDecoration: 'inherit',
                  }}
                >
                  <ListItem
                    controlScope="all"
                    onClick={() => setShowOffcanvas(false)}
                  >
                    <ListItem.Content
                      title="聯絡客服"
                      paragraph="前往ĒSEN 伊生LINE@"
                    />
                  </ListItem>
                </a>
              </Link>
            </Stack>
          </Stack>
          <ListItem>
            <ListItem.Content paragraph="© ĒSEN Medical. All rights reserved." />
          </ListItem>
        </Stack>
      </StyledOffcanvas>
    </Container>
  )
}

export default Navbar
