import Container from '@esen/essence/components/Container'
import Stack from '@esen/essence/components/Stack'
import styled from 'styled-components'
import AppLayout from './AppLayout'

const StyledOuterContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  justify-content: start;
  align-items: center;
  min-height: 100%;
`

const StyledInnerContainer = styled(Container)`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex-grow: 1;

  @media (max-width: 767px) {
    /* <= 768px */
    width: 100%;
  }
  @media (min-width: 768px) {
    /* 768px < */
    width: 768px;
  }
`

const PageLayout = ({ navbar, children, ...rest }) => {
  return (
    <AppLayout {...rest}>
      <StyledOuterContainer fluid size={false} variant="tertiary">
        <Stack grow={1} fluid>
          <StyledInnerContainer size={false} variant="tertiary">
            {navbar ? navbar : null}
            {children}
          </StyledInnerContainer>
        </Stack>
      </StyledOuterContainer>
    </AppLayout>
  )
}

export default PageLayout
