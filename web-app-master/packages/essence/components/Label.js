import styled from 'styled-components'

const fontWeightMap = {
  xs: 'medium',
  s: 'medium',
  m: 'medium',
  l: 'bold',
}

const StyledLabel = styled.label`
  font-family: var(--es-theme-font-family);
  white-space: nowrap;

  ${({ $disabled, $variant, $active }) => {
    if ($disabled) {
      return `
        user-select: none;
        pointer-events: none;
        color: var(--es-theme-fg-${$variant}-disabled);
      `
    } else if ($active) {
      return `
        color: var(--es-theme-fg-${$variant}-selected);
      `
    } else {
      return `
        color: var(--es-theme-fg-${$variant}-default);
      `
    }
  }}

  ${({ $size }) => {
    const fontWeightKey = fontWeightMap[$size]
    return `
      font-size: var(--es-theme-font-size-label-${$size});
      font-weight: var(--es-theme-font-weight-label-${fontWeightKey});
      line-height: var(--es-theme-line-height-label-${$size});
    `
  }}

  ${({ $align }) => {
    return `
      text-align: ${$align};
    `
  }}


  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}
`

const Label = ({
  variant = 'primary',
  size = 'm',
  align = 'left',
  active = false,
  pointer = false,
  disabled = false,
  ...rest
}) => {
  return (
    <StyledLabel
      $variant={variant}
      $active={active}
      $size={size}
      $align={align}
      $pointer={pointer}
      $disabled={disabled}
      {...rest}
    />
  )
}

export default Label
