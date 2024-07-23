import styled, { css } from 'styled-components'

const StyledHeader = styled.div`
  margin: 0px;
  padding: 0px;
  color: #171717;

  ${(props) => {
    if (props.$level === 1) {
      return css`
        font-size: 24px;
        font-weight: 700;
        line-height: 36px;
        vertical-align: middle;
      `
    } else if (props.$level === 2) {
      return css`
        font-size: 16px;
        font-weight: 700;
        line-height: 24px;
        vertical-align: middle;
      `
    } else if (props.$level === 3) {
      return css`
        font-size: 14px;
        font-weight: 700;
        line-height: 20px;
        vertical-align: middle;
      `
    }
  }}
`

const Header = ({ level, children, ...rest }) => {
  return (
    <StyledHeader as={`h${level}`} $level={level} {...rest}>
      {children}
    </StyledHeader>
  )
}

export default Header
