import { Children, createContext, forwardRef, useContext } from 'react'
import styled from 'styled-components'
import Badge from './Badge'
import Container from './Container'
import Icon from './Icon'
import Image from './Image'
import Inline from './Inline'
import Label from './Label'
import Stack from './Stack'
import Text from './Text'

const ListItemContext = createContext({})

const ControlScopeEnum = {
  NONE: 'none',
  ALL: 'all',
  CONTROL: 'control',
}

const StyledListItem = styled(Container)`
  min-height: var(--es-line-height-9);

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        &, & * {
          cursor: pointer;
        }
      `
    }
  }}
`

const StyledLabel = styled(Label)`
  word-break: break-all;
  white-space: normal;
`

const StyledMedia = styled(Stack)`
  ${({ $left }) => {
    if ($left) {
      return `
        padding-right: var(--es-theme-space-padding-m);
      `
    }
  }}
  ${({ $right }) => {
    if ($right) {
      return `
        margin-left: auto;
      `
    }
  }}
`

const StyledControl = styled(Inline)`
  margin-left: auto;

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        &, & * {
          cursor: pointer;
        }
      `
    }
  }}
`

const ListItem = forwardRef(
  (
    {
      controlScope = ControlScopeEnum.NONE,
      verticallyCentered = false,
      children,
      description,
      ...rest
    },
    ref
  ) => {
    const mediaIndex = Children.toArray(children).findIndex(
      (child) => child.type === ListItemMedia
    )
    const contentIndex = Children.toArray(children).findIndex(
      (child) => child.type === ListItemContent
    )
    const controlIndex = Children.toArray(children).findIndex(
      (child) => child.type === ListItemControl
    )
    return (
      <ListItemContext.Provider
        value={{
          controlScope,
          verticallyCentered,
          mediaIndex,
          contentIndex,
          controlIndex,
        }}
      >
        <StyledListItem
          ref={ref}
          fluid
          $pointer={controlScope === ControlScopeEnum.ALL}
          {...rest}
        >
          <Stack fluid alignItems="stretch" gap="s">
            <Inline alignItems={verticallyCentered ? 'center' : undefined}>
              {children}
            </Inline>
            {description && (
              <Text size="s" variant="tertiary">
                {description}
              </Text>
            )}
          </Stack>
        </StyledListItem>
      </ListItemContext.Provider>
    )
  }
)

const ListItemMedia = ({ image, children, ...rest }) => {
  const { mediaIndex, contentIndex, controlIndex } = useContext(ListItemContext)
  return (
    <StyledMedia
      fill
      justifyContent="start"
      $left={
        (contentIndex === -1 || mediaIndex <= contentIndex) &&
        (controlIndex === -1 || mediaIndex <= controlIndex)
      }
      $right={contentIndex < mediaIndex && controlIndex < mediaIndex}
      {...rest}
    >
      {children ? (
        children
      ) : (
        <Image rounded width={40} height={40} {...image} />
      )}
    </StyledMedia>
  )
}

const ListItemContent = ({
  title,
  titleProps,
  paragraph,
  metadata = [],
  badge,
  ...rest
}) => {
  return (
    <Stack gap="xs" justifyContent="center" {...rest}>
      {title && (
        <StyledLabel size="m" {...titleProps}>
          {title}
        </StyledLabel>
      )}
      {paragraph && (
        <Text size="s" variant="secondary">
          {paragraph}
        </Text>
      )}
      {metadata.length > 0 && (
        <Inline columnGap="s" rowGap="xs" wrap="wrap">
          {metadata.map((m) => (
            <Text key={m} size="xs" variant="secondary">
              {m}
            </Text>
          ))}
        </Inline>
      )}
      {badge && <Badge {...badge} />}
    </Stack>
  )
}

const ListItemControl = ({ badge, badgeComponent, icon, ...rest }) => {
  const { controlScope } = useContext(ListItemContext)
  return (
    <StyledControl
      alignItems="center"
      columnGap="s"
      $pointer={controlScope === ControlScopeEnum.CONTROL}
      {...rest}
    >
      {badge && <Badge size="xs" {...badge} />}
      {badgeComponent}
      {icon && <Icon size="l" name="arrow_forward_ios" {...icon} />}
    </StyledControl>
  )
}

ListItem.Media = ListItemMedia
ListItem.Content = ListItemContent
ListItem.Control = ListItemControl

export default ListItem
