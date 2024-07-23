import { forwardRef } from 'react'
import styled from 'styled-components'

const StyledFlex = styled.div`
  display: flex;

  ${({
    $direction,
    $grow,
    $shrink,
    $basis,
    $wrap,
    $justifyContent,
    $alignItems,
  }) => {
    return `
      flex-direction: ${$direction};
      flex-grow: ${$grow};
      flex-shrink: ${$shrink};
      flex-basis: ${$basis};
      flex-wrap: ${$wrap};
      justify-content: ${$justifyContent};
      align-items: ${$alignItems};
    `
  }}

  ${({ $rowGap }) => {
    if ($rowGap) {
      return `
        row-gap: var(--es-theme-space-margin-${$rowGap});
      `
    }
  }}

  ${({ $columnGap }) => {
    if ($columnGap) {
      return `
        column-gap: var(--es-theme-space-margin-${$columnGap});
      `
    }
  }}
`

const Flex = forwardRef(
  (
    {
      direction = 'row',
      grow = 0,
      shrink = 1,
      basis = 'auto',
      wrap = 'nowrap',
      justifyContent = 'start',
      alignItems = 'start',
      gap,
      rowGap,
      columnGap,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledFlex
        ref={ref}
        $direction={direction}
        $grow={grow}
        $shrink={shrink}
        $basis={basis}
        $wrap={wrap}
        $justifyContent={justifyContent}
        $alignItems={alignItems}
        $gap={gap}
        $rowGap={rowGap || gap}
        $columnGap={columnGap || gap}
        {...rest}
      />
    )
  }
)

export default Flex
