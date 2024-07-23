import styled from 'styled-components'

const fontWeightMap = {
  xs: 'bold',
  s: 'bold',
  m: 'bold',
  l: 'bold',
}

const StyledHeading = styled.h1`
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
      font-size: var(--es-theme-font-size-heading-${$size});
      line-height: var(--es-theme-line-height-heading-${$size});
      font-weight: var(--es-theme-font-weight-heading-${fontWeightKey});
    `
  }}
`

const sizeToTagMap = {
  l: 'h1',
  m: 'h2',
  s: 'h3',
  xs: 'h4',
}

const Heading = ({ variant = 'primary', size = 'm', ...rest }) => {
  return (
    <StyledHeading
      as={sizeToTagMap[size]}
      $variant={variant}
      $size={size}
      {...rest}
    />
  )
}

export default Heading
