import styled, { css } from 'styled-components'


const StyledUnderlineTab = styled.div`
  display: flex;
`

const StyledUnderlineTabItem = styled.div`
  padding: 16px 14px;
  color: #737373;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  border-bottom: 2px solid transparent;

  ${props => (
    props.$active && css`
      color: #171717;
      border-bottom: 2px solid #171717;
    `
  )}
`

const UnderlineTab = ({ children, ...rest }) => {
  return (
    <StyledUnderlineTab {...rest}>
      {children}
    </StyledUnderlineTab>
  )
}

const UnderlineTabItem = ({ active, children, ...rest }) => {
  return (
    <StyledUnderlineTabItem {...rest} $active={active}>
      {children}
    </StyledUnderlineTabItem>
  )
}

UnderlineTab.Item = UnderlineTabItem

export default UnderlineTab
