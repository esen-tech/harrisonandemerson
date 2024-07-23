import { forwardRef } from 'react'
import styled, { css } from 'styled-components'

const StyledButton = styled.button`
  display: inline-block;
  padding: 14px 16px;
  font-size: 12px;
  font-weight: 400;
  line-height: 16px;
  text-align: center;
  text-decoration: none;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border-radius: 4px;

  ${({ $variant, $outlined }) => {
    switch ($variant) {
      case 'primary': {
        if ($outlined) {
          return css`
            color: #b91c1c;
            border: 1px solid #b91c1c;
            background-color: transparent;
          `
        } else {
          return css`
            color: white;
            border: 1px solid #324137;
            background-color: #324137;
          `
        }
      }
      case 'light': {
        return css`
          color: #171615;
          border: none;
          background-color: #f6f6f6;
        `
      }
      case 'danger': {
        if ($outlined) {
          return css`
            color: #dc2626;
            border: 1px solid #dc2626;
            background-color: transparent;
          `
        } else {
          return css`
            color: #b91c1c;
            border: 1px solid #b91c1c;
            background-color: transparent;
          `
        }
      }
    }
  }}

  ${({ $disabled }) =>
    $disabled &&
    css`
      pointer-events: none;
      opacity: 0.65;
    `}
`

const Button = forwardRef(
  ({ variant, disabled, outlined, children, ...rest }, ref) => (
    <StyledButton
      ref={ref}
      $variant={variant}
      $disabled={disabled}
      $outlined={outlined}
      {...rest}
    >
      {children}
    </StyledButton>
  )
)

export default Button
