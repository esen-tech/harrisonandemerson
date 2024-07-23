import { forwardRef } from 'react'
import styled from 'styled-components'

const StyledContainer = styled.div`
  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}

  ${({ $fill }) => {
    if ($fill) {
      return `
        height: 100%;
      `
    }
  }}

  ${({ $variant }) => {
    if ($variant) {
      return `
        background-color: var(--es-theme-bg-${$variant}-default);
      `
    }
  }}

  ${({ $size, $squished }) => {
    const squishedKey = $squished ? '-squished' : ''
    return `
      padding: var(--es-theme-space-padding${squishedKey}-${$size});
    `
  }}
`

const Container = forwardRef(
  (
    {
      size = 'm',
      squished = false,
      fluid = false,
      fill = false,
      variant = 'primary',
      ...rest
    },
    ref
  ) => {
    return (
      <StyledContainer
        ref={ref}
        $size={size}
        $squished={squished}
        $fluid={fluid}
        $fill={fill}
        $variant={variant}
        {...rest}
      />
    )
  }
)

export default Container
