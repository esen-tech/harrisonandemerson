import styled from 'styled-components'
import Flex from './Flex'
import Inline from './Inline'

const TypeEnum = {
  STRIP: 'strip',
  DOT: 'dot',
}

const variantPaletteMap = {
  primary: 'tertiary',
  secondary: 'tertiary',
  tertiary: 'tertiary',
}

const StyledStripProgressItem = styled(Flex)`
  height: 4px;

  ${({ $variant, $active }) => {
    const palette = variantPaletteMap[$variant] || $variant
    return $active
      ? `
      background-color: var(--es-theme-bg-inversed-${palette}-default);
    `
      : `
      background-color: var(--es-theme-bg-${palette}-selected);
    `
  }}
`

const StyledDotProgressItem = styled(Flex)`
  height: var(--es-theme-space-margin-s);
  width: var(--es-theme-space-margin-s);
  border-radius: 50%;

  ${({ $variant, $active }) => {
    const palette = variantPaletteMap[$variant] || $variant
    return $active
      ? `
      background-color: var(--es-theme-bg-inversed-${palette}-default);
    `
      : `
      background-color: var(--es-theme-bg-${palette}-selected);
    `
  }}
`

const Progress = ({ type, now, count, variant = 'info', ...rest }) => {
  switch (type) {
    case TypeEnum.STRIP: {
      return (
        <Inline fluid gap="s" {...rest}>
          {new Array(count).fill(0).map((_, i) => (
            <StyledStripProgressItem
              key={i}
              grow={1}
              $variant={variant}
              $active={i <= now}
            />
          ))}
        </Inline>
      )
    }
    case TypeEnum.DOT: {
      return (
        <Flex gap="xs" justifyContent="center" {...rest}>
          {new Array(count).fill(0).map((_, i) => (
            <StyledDotProgressItem
              key={i}
              $variant={variant}
              $active={i === now}
            />
          ))}
        </Flex>
      )
    }
  }
}

export default Progress
