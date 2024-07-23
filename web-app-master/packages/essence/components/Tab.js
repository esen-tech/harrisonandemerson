import { createContext, useContext } from 'react'
import styled from 'styled-components'
import Container from './Container'
import Inline from './Inline'
import Label from './Label'

const TabContext = createContext({})

const TypeEnum = {
  UNDERLINE: 'underline',
  PILL: 'pill',
}

const StyledUnderlineTab = styled(Container)``

const StyledUnderlineTabItem = styled(Inline)`
  padding: var(--es-space-16) var(--es-space-12);
  border-bottom: 2px solid transparent;

  &,
  & * {
    cursor: pointer;
  }

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        flex-grow: 1;
      `
    }
  }}

  ${({ $active }) => {
    if ($active) {
      return `
        border-bottom: 2px solid var(--es-theme-border-primary-selected);
      `
    }
  }}
`

const StyledPillTab = styled(Container)`
  border-radius: 50px;
  padding: var(--es-theme-space-margin-xs);

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        display: block;
      `
    } else {
      return `
        display: inline-block;
      `
    }
  }}
`

const StyledPillTabItem = styled(Inline)`
  padding: var(--es-theme-space-margin-s) var(--es-theme-space-margin-l);
  border-radius: 50px;

  &,
  & * {
    cursor: pointer;
  }

  ${({ $active }) => {
    if ($active) {
      return `
        background-color: var(--es-theme-bg-primary-default);
      `
    }
  }}
`

const Tab = ({
  type = TypeEnum.UNDERLINE,
  fluid = false,
  children,
  ...rest
}) => {
  let tab = null
  switch (type) {
    case TypeEnum.UNDERLINE: {
      tab = (
        <StyledUnderlineTab size={false} {...rest}>
          <Inline gap="m">{children}</Inline>
        </StyledUnderlineTab>
      )
      break
    }
    case TypeEnum.PILL: {
      tab = (
        <StyledPillTab variant="tertiary" size={false} fluid={fluid} {...rest}>
          <Inline>{children}</Inline>
        </StyledPillTab>
      )
      break
    }
  }
  return (
    <TabContext.Provider value={{ type, fluid }}>{tab}</TabContext.Provider>
  )
}

const TabItem = ({ active, children, ...rest }) => {
  const { type, fluid } = useContext(TabContext)
  switch (type) {
    case TypeEnum.UNDERLINE: {
      return (
        <StyledUnderlineTabItem
          grow={fluid ? 1 : 0}
          justifyContent="center"
          $active={active}
          {...rest}
        >
          <Label
            size="s"
            variant={active ? 'primary' : 'tertiary'}
            active={active}
          >
            {children}
          </Label>
        </StyledUnderlineTabItem>
      )
    }
    case TypeEnum.PILL: {
      return (
        <StyledPillTabItem
          grow={fluid ? 1 : 0}
          justifyContent="center"
          $active={active}
          {...rest}
        >
          <Label size="xs">{children}</Label>
        </StyledPillTabItem>
      )
    }
  }
}

Tab.Item = TabItem

export default Tab
