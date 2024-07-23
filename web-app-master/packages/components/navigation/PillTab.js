import styled, { css } from 'styled-components'

const StyledPillTab = styled.div`
  display: flex;
  background: #f5f5f5;
  color: #262626;
  border-radius: 50px;
`

const StyledPillTabItem = styled.div`
  flex: 1 1 auto;
  padding: 8px;
  margin: 4px;
  border-radius: 50px;
  text-align: center;
  cursor: pointer;

  font-size: 12px;
  line-height: 16px;
  color: #262626;

  ${(props) =>
    props.$active &&
    css`
      background: #ffffff;
    `}
`

const PillTab = ({ children, ...rest }) => {
  return <StyledPillTab {...rest}>{children}</StyledPillTab>
}

const PillTabItem = ({ active, children, ...rest }) => {
  return (
    <StyledPillTabItem {...rest} $active={active}>
      {children}
    </StyledPillTabItem>
  )
}

PillTab.Item = PillTabItem

export default PillTab
