import { forwardRef } from 'react'
import styled from 'styled-components'

const StyledHyperlink = styled.a`
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  text-decoration: none;

  ${({ disabled }) => {
    if (disabled) {
      return `
        pointer-events: none;
        color: var(--es-theme-fg-info-disabled);
      `
    } else {
      return `
        cursor: pointer;
        color: var(--es-theme-fg-info-default);

        &:hover {
          color: var(--es-theme-fg-info-hovered);
        }

        &:active {
          color: var(--es-theme-fg-info-selected);
        }
      `
    }
  }}
`

const Hyperlink = forwardRef(({ disabled, ...rest }, ref) => {
  return <StyledHyperlink ref={ref} disabled={disabled} {...rest} />
})

export default Hyperlink
