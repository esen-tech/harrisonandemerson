import styled from 'styled-components'
import Icon from './Icon'
import Inline from './Inline'
import Label from './Label'

const StyledSideNav = styled.div`
  width: 100%;
`

const StyledHeader = styled.div`
  padding: var(--es-space-8) var(--es-space-20);
  border-left: 2px solid transparent;
`

const StyledItem = styled.div`
  padding: var(--es-space-8) var(--es-space-20);
  cursor: pointer;

  ${({ $active }) => {
    if ($active) {
      return `
        background-color: var(--es-theme-bg-tertiary-default);
        border-left: 2px solid var(--es-theme-border-primary-selected);
      `
    } else {
      return `
        border-left: 2px solid transparent;
      `
    }
  }}
`

const SideNavHeader = ({ title, ...rest }) => {
  return (
    <StyledHeader {...rest}>
      <Label size="xs" variant="tertiary">
        {title}
      </Label>
    </StyledHeader>
  )
}

const SideNavItem = ({ icon, label, active, ...rest }) => {
  return (
    <StyledItem $active={active} {...rest}>
      <Inline gap="m" alignItems="center">
        {icon && <Icon sizeInPixel={16} {...icon} />}
        <Label size="s" variant="secondary" pointer>
          {label}
        </Label>
      </Inline>
    </StyledItem>
  )
}

const SideNav = (props) => {
  return <StyledSideNav {...props} />
}

SideNav.Header = SideNavHeader
SideNav.Item = SideNavItem

export default SideNav
