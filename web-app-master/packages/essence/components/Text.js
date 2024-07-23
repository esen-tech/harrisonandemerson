import { Children } from 'react'
import styled from 'styled-components'
import WithSeparator from './WithSeparator'

const fontWeightMap = {
  xs: 'regular',
  s: 'regular',
  m: 'regular',
  l: 'regular',
}

const StyledText = styled.p`
  font-family: var(--es-theme-font-family);
  margin: 0;

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}

  ${({ $variant, $disabled }) => {
    if ($disabled) {
      return `
        user-select: none;
        pointer-events: none;
        color: var(--es-theme-fg-${$variant}-disabled);
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
      font-size: var(--es-theme-font-size-body-${$size});
      font-weight: var(--es-theme-font-weight-body-${fontWeightKey});
      line-height: var(--es-theme-line-height-body-${$size});
    `
  }}

  /* ${({ $multiLine }) => {
    if ($multiLine) {
      return `
        white-space: pre-line;
      `
    }
  }} */

  ${({ $truncated }) => {
    if ($truncated) {
      return `
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
      `
    }
  }}

  ${({ $multiLine, $truncated, $lineClamp }) => {
    if ($multiLine && $truncated) {
      return `
        display: -webkit-box;
        -webkit-line-clamp: ${$lineClamp};
        -webkit-box-orient: vertical;
        white-space: normal;
      `
    }
  }}

  ${({ $align }) => {
    return `
      text-align: ${$align};
    `
  }}

  ${({ $wrap }) => {
    if (!$wrap) {
      return `
        white-space: nowrap;
      `
    }
  }}

  ${({ $lineThrough }) => {
    if ($lineThrough) {
      return `
        text-decoration: line-through;
      `
    }
  }}

  ${({ $bold }) => {
    if ($bold) {
      return `
        font-weight: bold;
      `
    }
  }}
`

const Text = ({
  variant = 'primary',
  size = 'm',
  multiLine = true,
  lineClamp = 3,
  truncated = false,
  fluid = false,
  align = 'left',
  pointer = false,
  disabled = false,
  wrap = true,
  lineThrough = false,
  bold = false,
  children,
  ...rest
}) => {
  return (
    <StyledText
      $variant={variant}
      $size={size}
      $truncated={truncated}
      $align={align}
      $fluid={fluid}
      $multiLine={multiLine}
      $lineClamp={lineClamp}
      $pointer={pointer}
      $disabled={disabled}
      $wrap={wrap}
      $lineThrough={lineThrough}
      $bold={bold}
      {...rest}
    >
      {multiLine
        ? Children.toArray(children).map((child, i) => {
            if (typeof child === 'string') {
              return (
                <WithSeparator key={`text-${i}`} separator={<br />}>
                  {child.split('\n')}
                </WithSeparator>
              )
            } else {
              return child
            }
          })
        : children}
    </StyledText>
  )
}

export default Text
