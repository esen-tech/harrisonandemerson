import 'material-symbols'
import { forwardRef } from 'react'
import styled, { css } from 'styled-components'

const StyledIcon = styled.span`
  ${(props) => css`
    font-variation-settings: 'FILL' ${props.$fill}, 'wght' 400, 'GRAD' 0,
      'opsz' 24;
    font-size: ${props.$size}px;
  `}

  // https://stackoverflow.com/questions/39907145/align-material-icon-with-text-on-materialize
  vertical-align: bottom;
`

const Icon = forwardRef(
  ({ name, fill = 1, size = 24, className = '', ...rest }, ref) => (
    <StyledIcon
      ref={ref}
      className={`material-symbols-sharp ${className}`}
      $fill={fill}
      $size={size}
      {...rest}
    >
      {name}
    </StyledIcon>
  )
)

export default Icon
