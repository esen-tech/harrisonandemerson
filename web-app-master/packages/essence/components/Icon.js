import 'material-symbols'
import { forwardRef } from 'react'
import styled from 'styled-components'

const StyledIcon = styled.span`
  user-select: none;

  // https://stackoverflow.com/questions/39907145/align-material-icon-with-text-on-materialize
  vertical-align: bottom;

  ${({ $size, $sizeInPixel }) => {
    if ($sizeInPixel) {
      return `
        font-size: ${$sizeInPixel}px;
      `
    } else {
      return `
        font-size: var(--es-theme-font-size-body-${$size});
      `
    }
  }}

  ${({ $fill }) => {
    return `
      font-variation-settings: 'FILL' ${
        $fill ? 1 : 0
      }, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    `
  }}

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}

  ${({ $variant, $inversed, $disabled }) => {
    const inversedKey = $inversed ? `-inversed` : ''
    if ($disabled) {
      return `
        user-select: none;
        pointer-events: none;
        color: var(--es-theme-fg${inversedKey}-${$variant}-disabled);
      `
    } else {
      return `
        color: var(--es-theme-fg${inversedKey}-${$variant}-default);
      `
    }
  }}
`

const Icon = forwardRef(
  (
    {
      name,
      fill = true,
      size = 'm',
      className = '',
      sizeInPixel,
      variant = 'primary',
      inversed = false,
      pointer = false,
      disabled = false,
      ...rest
    },
    ref
  ) => (
    <StyledIcon
      ref={ref}
      className={`material-symbols-sharp ${className}`}
      $fill={fill}
      $size={size}
      $sizeInPixel={sizeInPixel}
      $variant={variant}
      $inversed={inversed}
      $pointer={pointer}
      $disabled={disabled}
      {...rest}
    >
      {name}
    </StyledIcon>
  )
)

export default Icon
