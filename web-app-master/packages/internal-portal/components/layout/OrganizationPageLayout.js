import Inline from '@esen/essence/components/Inline'
import Stack from '@esen/essence/components/Stack'
import styled from 'styled-components'
import TopNavigation from '../navigation/TopNavigation'
import AppLayout from './AppLayout'

const StyledNavStack = styled(Stack)`
  min-width: 240px;
  max-width: 240px;
  border-right: 1px solid var(--es-theme-border-primary-disabled);
`

const StyledContentStack = styled(Stack)`
  position: relative;
  background-color: var(--es-theme-bg-primary-disabled);
`

const OrganizationPageLayout = ({ leftNavigation, children, ...rest }) => {
  return (
    <AppLayout {...rest}>
      <Stack fluid fill>
        <TopNavigation />
        <Inline fluid grow={1}>
          {leftNavigation && (
            <StyledNavStack fluid fill>
              {leftNavigation}
            </StyledNavStack>
          )}
          <StyledContentStack fill grow={1}>
            {children}
          </StyledContentStack>
        </Inline>
      </Stack>
    </AppLayout>
  )
}

export default OrganizationPageLayout
