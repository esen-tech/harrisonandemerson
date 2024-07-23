import styled from 'styled-components'
import Label from './Label'

const variantBgPaletteMap = {
  primary: 'neutral-50',
  secondary: 'neutral-50',
  tertiary: 'neutral-50',
  negative: 'negative-50',
  positive: 'positive-50',
  warning: 'warning-100',
  info: 'info-50',
}

const variantFgPaletteMap = {
  primary: 'neutral-900',
  secondary: 'neutral-900',
  tertiary: 'neutral-900',
  negative: 'negative-500',
  positive: 'positive-500',
  warning: 'warning-500',
  info: 'info-500',
}

const StyledBadge = styled(Label)`
  user-select: none;
  border-radius: var(--es-border-radius-0);
  padding: var(--es-theme-space-padding-squished-xs);

  ${({ $variant, $inversed }) => {
    if ($inversed) {
      return `
        color: var(--es-${variantBgPaletteMap[$variant]});
        background-color: var(--es-${variantFgPaletteMap[$variant]});
      `
    } else {
      return `
        color: var(--es-${variantFgPaletteMap[$variant]});
        background-color: var(--es-${variantBgPaletteMap[$variant]});
      `
    }
  }}
`

const Badge = ({ variant = 'primary', inversed = false, ...rest }) => {
  return (
    <StyledBadge size="xs" $variant={variant} $inversed={inversed} {...rest} />
  )
}

export default Badge
