import { forwardRef } from 'react'
import styled from 'styled-components'

const variantPaletteMap = {
  primary: 'primary',
  secondary: 'primary',
  tertiary: 'primary',
}

const StyledInput = styled.input`
  border-radius: var(--es-border-radius-0);

  &:focus {
    outline: none;
  }

  &::placeholder {
    color: var(--es-neutral-500);
  }

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}

  ${({ $size }) => {
    return `
      padding: var(--es-theme-space-padding-squished-${$size});

      &, &::placeholder {
        font-size: var(--es-theme-font-size-body-${$size});
        font-weight: var(--es-theme-font-weight-body-regular);
        line-height: var(--es-theme-line-height-body-${$size});
      }
    `
  }}

  ${({ $variant, readOnly, disabled }) => {
    const palette = variantPaletteMap[$variant] || $variant

    if (disabled) {
      return `
        &, &::placeholder {
          color: var(--es-theme-fg-${palette}-disabled);
        }
        background-color: var(--es-white);
        border: 1px solid var(--es-theme-border-${palette}-disabled);
      `
    } else if (readOnly) {
      return `
        padding: 0;
        border: none;
        color: var(--es-theme-fg-${palette}-default);
      `
    } else {
      return `
        color: var(--es-theme-fg-${palette}-default);
        // background-color: var(--es-theme-bg-${palette}-default);
        border: 1px solid var(--es-theme-border-${palette}-default);

        &:hover:not(:disabled) {
          color: var(--es-theme-fg-${palette}-hovered);
          // background-color: var(--es-theme-bg-${palette}-hovered);
          border: 1px solid var(--es-theme-border-${palette}-hovered);
        }

        &:active:not(:disabled) {
          color: var(--es-theme-fg-${palette}-selected);
          // background-color: var(--es-theme-bg-${palette}-selected);
          border: 1px solid var(--es-theme-border-${palette}-selected);
        }
      `
    }
  }}
`

const Input = forwardRef(
  (
    {
      type = 'text',
      size = 'm',
      variant = 'primary',
      fluid = false,
      readOnly = false,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledInput
        ref={ref}
        type={type}
        readOnly={readOnly}
        $size={size}
        $variant={variant}
        $fluid={fluid}
        {...rest}
      />
    )
  }
)

export default Input
