import styled from 'styled-components'

const fontWeightMap = {
  xs: 'medium',
  s: 'bold',
  m: 'bold',
  l: 'bold',
}

const StyledDisplay = styled.h1`
  font-family: var(--es-theme-font-family);
  margin: 0;

  ${({ $variant }) => {
    return `
      color: var(--es-theme-fg-${$variant}-default);
    `
  }}

  ${({ $size }) => {
    const fontWeightKey = fontWeightMap[$size]
    return `
      font-size: var(--es-theme-font-size-display-${$size});
      line-height: var(--es-theme-line-height-display-${$size});
      font-weight: var(--es-theme-font-weight-display-${fontWeightKey});
    `
  }}
`

const Display = ({ variant = 'primary', size = 'm', ...rest }) => {
  return <StyledDisplay $variant={variant} $size={size} {...rest} />
}

export default Display
