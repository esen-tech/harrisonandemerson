import { forwardRef } from 'react'
import styled from 'styled-components'
import Flex from './Flex'
import Image from './Image'
import LoadingIndicator from './LoadingIndicator'
import Text from './Text'

const fgVariantPaletteMap = {
  primary: 'primary',
  secondary: 'primary',
  tertiary: 'primary',
}

const bgVariantPaletteMap = {
  primary: 'tertiary',
  secondary: 'tertiary',
  tertiary: 'tertiary',
}

const StyledButton = styled.button`
  border: none;
  border-radius: var(--es-border-radius-0);
  user-select: none;
  max-width: 100%;

  /* https://css-tricks.com/using-flexbox-and-text-ellipsis-together/ */
  /* https://css-tricks.com/flexbox-truncated-text/ */
  min-width: 0;

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
    `
  }}

  ${({ $loading }) => {
    if ($loading) {
      return `
        pointer-events: none;
      `
    }
  }}

  ${({ $variant, $active, disabled, $inversed }) => {
    const inversedKey = $inversed ? `-inversed` : ''
    const fgPalette = fgVariantPaletteMap[$variant] || $variant
    const bgPalette = bgVariantPaletteMap[$variant] || $variant

    if (disabled) {
      return `
        color: var(--es-theme-fg${inversedKey}-${fgPalette}-disabled);
        background-color: var(--es-theme-bg${inversedKey}-${bgPalette}-disabled);
      `
    } else if ($active) {
      return `
        cursor: pointer;
        color: var(--es-theme-fg${inversedKey}-${fgPalette}-selected);
        background-color: var(--es-theme-bg${inversedKey}-${bgPalette}-selected);
      `
    } else {
      return `
        cursor: pointer;
        color: var(--es-theme-fg${inversedKey}-${fgPalette}-default);
        background-color: var(--es-theme-bg${inversedKey}-${bgPalette}-default);

        &:hover:not(:disabled) {
          color: var(--es-theme-fg${inversedKey}-${fgPalette}-hovered);
          background-color: var(--es-theme-bg${inversedKey}-${bgPalette}-hovered);
        }

        &:active:not(:disabled) {
          color: var(--es-theme-fg${inversedKey}-${fgPalette}-selected);
          background-color: var(--es-theme-bg${inversedKey}-${bgPalette}-selected);
        }
      `
    }
  }}
`

const StyledPlaceholder = styled(Flex)`
  ${({ $gapLeft }) => {
    if ($gapLeft) {
      return `
        margin-left: var(--es-theme-space-margin-s);
      `
    }
  }}

  ${({ $gapRight }) => {
    if ($gapRight) {
      return `
        margin-right: var(--es-theme-space-margin-s);
      `
    }
  }}
`

const StyledImage = styled(Image)`
  animation-name: spin;
  animation-duration: 1000ms;
  animation-iteration-count: infinite;
  animation-timing-function: linear;

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`

const Button = forwardRef(
  (
    {
      prefix,
      suffix,
      disabled = false,
      size = 'm',
      fluid = false,
      active = false,
      variant = 'primary',
      inversed = false,
      loading = false,
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledButton
        ref={ref}
        $fluid={fluid}
        $active={active}
        $variant={variant}
        $inversed={inversed}
        $size={size}
        $loading={loading}
        disabled={disabled}
        {...rest}
      >
        {loading && !disabled ? (
          <Flex alignItems="center" justifyContent="center">
            <LoadingIndicator spinning size={size} />
          </Flex>
        ) : (
          <Flex alignItems="center">
            <StyledPlaceholder
              grow={1}
              justifyContent="start"
              $gapRight={prefix}
            >
              {prefix}
            </StyledPlaceholder>
            <Text truncated size={size} variant={false}>
              {children}
            </Text>
            <StyledPlaceholder grow={1} justifyContent="end" $gapLeft={suffix}>
              {suffix}
            </StyledPlaceholder>
          </Flex>
        )}
      </StyledButton>
    )
  }
)

export default Button
