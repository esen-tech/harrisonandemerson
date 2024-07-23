import styled from 'styled-components'
import Badge from './Badge'
import Icon from './Icon'
import Image from './Image'
import Inline from './Inline'
import Label from './Label'
import Stack from './Stack'
import Text from './Text'

const StyledStackItem = styled(Inline)`
  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}

  ${({ $fixedHeight }) => {
    if ($fixedHeight) {
      return `
        height: var(--es-line-height-9);
      `
    }
  }}
`

const StyledMedia = styled(Stack)`
  padding: var(--es-theme-space-padding-m);
`

const StyledTitle = styled(Label)`
  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}
`

const StyledContentStack = styled(Stack)`
  padding: var(--es-theme-space-padding-squished-xl);

  ${({ $hasImage }) => {
    if ($hasImage) {
      return `
        padding-left: 0;
      `
    }
  }}
`

const StyledControl = styled(Inline)`
  padding: var(--es-theme-space-padding-squished-l);

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}
`

const StyledBadge = styled(Badge)`
  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}
`

const StackItem = ({
  image,
  title,
  metadata = [],
  controlAlignItems,
  badge,
  icon,
  actionScope = 'all',
  ...rest
}) => {
  const isFixedHeight = title && metadata.length === 0
  const defaultControlAlignItems = isFixedHeight ? 'center' : 'start'
  const isAllClickable = actionScope === 'all'
  const isOnlyControlClickable = actionScope === 'control'

  return (
    <StyledStackItem
      fluid
      alignItems="stretch"
      justifyContent="space-between"
      $fixedHeight={isFixedHeight}
      $pointer={isAllClickable}
      {...rest}
    >
      <Inline fluid>
        {image && (
          <StyledMedia fill justifyContent="start">
            <Image rounded width={40} height={40} {...image} />
          </StyledMedia>
        )}
        <StyledContentStack $hasImage={image} gap="xs">
          {title && (
            <StyledTitle size="m" $pointer={isAllClickable}>
              {title}
            </StyledTitle>
          )}
          <Inline columnGap="s" rowGap="xs" wrap="wrap">
            {metadata.length > 0 &&
              metadata.map((m) => (
                <Text key={m} size="s" variant="secondary">
                  {m}
                </Text>
              ))}
          </Inline>
        </StyledContentStack>
      </Inline>
      <StyledControl
        alignItems={controlAlignItems || defaultControlAlignItems}
        columnGap="s"
        $pointer={isOnlyControlClickable}
      >
        {badge && (
          <StyledBadge
            size="xs"
            {...badge}
            $pointer={isAllClickable || isOnlyControlClickable}
          />
        )}
        {icon && <Icon size="l" name="arrow_forward_ios" {...icon} />}
      </StyledControl>
    </StyledStackItem>
  )
}

export default StackItem
