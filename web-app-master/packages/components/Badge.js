import styled, { css } from 'styled-components'

const StyledBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 12px;
  line-height: 16px;

  ${(props) => {
    switch (props.$variant) {
      case 'info': {
        return css`
          background-color: #dbeafe;
          color: #1e3a8a;
        `
      }
      case 'success': {
        return css`
          background-color: #dcfce7;
          color: #14532d;
        `
      }
      case 'light': {
        return css`
          background-color: #f5f5f5;
          color: #171717;
        `
      }
      case 'danger': {
        return css`
          background-color: #fee2e2;
          color: #7f1d1d;
        `
      }
    }
  }}
`

const Badge = ({ variant, children, ...rest }) => {
  return (
    <StyledBadge $variant={variant} {...rest}>
      {children}
    </StyledBadge>
  )
}

export default Badge
