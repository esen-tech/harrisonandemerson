import Container from '@esen/essence/components/Container'
import Grid from '@esen/essence/components/Grid'
import Heading from '@esen/essence/components/Heading'
import Inline from '@esen/essence/components/Inline'
import Stack from '@esen/essence/components/Stack'
import { Children } from 'react'
import styled from 'styled-components'
import SidePanel from './SidePanel'

const StyledPageSection = styled(Container)`
  ${({ $transparent }) => {
    if ($transparent) {
      return `
        background-color: transparent;
      `
    }
  }}

  ${({ $borderBottom }) => {
    if ($borderBottom) {
      return `
        border-bottom: 1px solid var(--es-theme-border-primary-disabled);
      `
    }
  }}

  ${({ $inset }) => {
    if ($inset) {
      return `
        border-radius: var(--es-border-radius-1);
        border: 1px solid var(--es-theme-border-primary-disabled);
      `
    }
  }}

  ${({ $horizontalScrollable }) => {
    if ($horizontalScrollable) {
      return `
        overflow-x: auto;
      `
    }
  }}
`

const PageSection = ({
  children,
  borderBottom = true,
  inset = false,
  horizontalScrollable = false,
  transparent = false,
  ...rest
}) => {
  return (
    <StyledPageSection
      size="l"
      fluid
      $borderBottom={borderBottom}
      $inset={inset}
      $horizontalScrollable={horizontalScrollable}
      $transparent={transparent}
      {...rest}
    >
      {children}
    </StyledPageSection>
  )
}

const StyledPageHeader = styled(PageSection)`
  border-bottom: 1px solid var(--es-theme-border-primary-disabled);

  ${({ $tab }) => {
    if ($tab) {
      return `
        padding-bottom: 0;
      `
    }
  }}
`

const StyledPageFooter = styled(PageSection)`
  position: sticky;
  bottom: 0px;
`

const PageHeader = ({ title, subtitle, tab, leftControl, rightControl }) => {
  return (
    <StyledPageHeader $tab={tab}>
      <Stack gap="s">
        <Inline fluid justifyContent="space-between">
          <Inline gap="xl" alignItems="center">
            <Heading size="l">{title}</Heading>
            {leftControl}
          </Inline>
          <div style={{ display: 'flex' }}>{rightControl}</div>
        </Inline>
        {subtitle}
        {tab}
      </Stack>
    </StyledPageHeader>
  )
}

const PageFooter = ({ children, ...rest }) => {
  return (
    <StyledPageFooter borderBottom={false} {...rest}>
      {children}
    </StyledPageFooter>
  )
}

const Page = ({ children }) => {
  const nonFooterChildren = Children.toArray(children).filter(
    (child) => child.type !== PageFooter && child.type !== SidePanel
  )
  const footerChildren = Children.toArray(children).filter(
    (child) => child.type === PageFooter
  )
  const sidePanelChildren = Children.toArray(children).filter(
    (child) => child.type === SidePanel
  )

  return (
    <Grid fluid columns={12} style={{ flexGrow: 1 }}>
      <Grid.Area columnSpan={sidePanelChildren.length === 0 ? 12 : 8}>
        <Stack fluid grow={1} style={{ height: '100%' }}>
          {nonFooterChildren}
          <div style={{ flexGrow: 1 }} />
          {footerChildren}
        </Stack>
      </Grid.Area>
      {sidePanelChildren.length > 0 && (
        <Grid.Area columnSpan={4}>{sidePanelChildren}</Grid.Area>
      )}
    </Grid>
  )
}

Page.Header = PageHeader
Page.Section = PageSection
Page.Footer = PageFooter
Page.SidePanel = SidePanel

export default Page
