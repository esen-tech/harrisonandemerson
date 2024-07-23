import { forwardRef } from 'react'
import styled from 'styled-components'
import Flex from './Flex'

const StyledInline = styled(Flex)`
  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}
`

const Inline = forwardRef(({ fluid = false, gap, children, ...rest }, ref) => {
  return (
    <StyledInline ref={ref} direction="row" gap={gap} $fluid={fluid} {...rest}>
      {children}
    </StyledInline>
  )
})

export default Inline
