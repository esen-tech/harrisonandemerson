import { forwardRef } from 'react'
import styled from 'styled-components'
import Flex from './Flex'

const StyledFlex = styled(Flex)`
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
        // min-height: -webkit-fill-available;
        height: 100%;
      `
    }
  }}
`

const Stack = forwardRef(
  ({ fluid = false, fill = false, gap, children, ...rest }, ref) => {
    return (
      <StyledFlex
        ref={ref}
        direction="column"
        gap={gap}
        $fluid={fluid}
        $fill={fill}
        {...rest}
      >
        {children}
      </StyledFlex>
    )
  }
)

export default Stack
