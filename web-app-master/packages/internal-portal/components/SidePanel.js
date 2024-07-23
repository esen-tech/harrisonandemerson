import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import WithSeparator from '@esen/essence/components/WithSeparator'
import styled from 'styled-components'

const StyledSidePanel = styled(Stack)`
  background-color: var(--es-theme-bg-primary-default);
  border-left: 1px solid var(--es-theme-border-primary-disabled);
`

const StyledSidePanelSection = styled(Stack)``

const SidePanelSection = ({ title, control, children, ...rest }) => {
  return (
    <StyledSidePanelSection fluid {...rest}>
      {title && (
        <Container fluid size="m">
          <Inline fluid justifyContent="space-between">
            <Label size="s" variant="tertiary">
              {title}
            </Label>
            {control}
          </Inline>
        </Container>
      )}
      {children}
    </StyledSidePanelSection>
  )
}

const SidePanel = ({ title, onClose, children, ...rest }) => {
  return (
    <StyledSidePanel fill {...rest}>
      <Container fluid size="m">
        <Spacer ySize="s" />
        <Inline fluid justifyContent="space-between" alignItems="center">
          <Heading size="l">{title}</Heading>
          <Icon name="close" sizeInPixel={16} pointer onClick={onClose} />
        </Inline>
        <Spacer ySize="s" />
      </Container>
      <WithSeparator leading separator={<Divider />}>
        {children}
      </WithSeparator>
    </StyledSidePanel>
  )
}

SidePanel.Section = SidePanelSection

export default SidePanel
