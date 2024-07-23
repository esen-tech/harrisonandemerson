import { createContext, forwardRef, useContext } from 'react'
import styled from 'styled-components'
import Container from './Container'
import Image from './Image'
import Inline from './Inline'
import Label from './Label'
import Stack from './Stack'
import Text from './Text'

const CardContext = createContext({})

const ControlScopeEnum = {
  NONE: 'none',
  ALL: 'all',
  CONTROL: 'control',
}

const StyledCard = styled(Stack)`
  overflow: auto;

  ${({ $inset, $active }) => {
    if ($inset) {
      if ($active) {
        return `
          border: 1px solid var(--es-theme-border-primary-selected);
        `
      } else {
        return `
          border: 1px solid var(--es-theme-border-primary-default);
        `
      }
    }
  }}

  ${({ $inset }) => {
    if ($inset) {
      return `
        border-radius: var(--es-border-radius-0);
      `
    }
  }}

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

const StyledMedia = styled(Stack)`
  ${({ $inset }) => {
    if ($inset) {
      return `
        padding: var(--es-theme-space-padding-m) var(--es-theme-space-padding-m) 0 var(--es-theme-space-padding-m);
      `
    }
  }}
`

const StyledContent = styled(Container)``

const StyledLabel = styled(Label)`
  white-space: normal;
`

const StyledControl = styled(Stack)`
  padding: 0 var(--es-theme-space-padding-m) var(--es-theme-space-padding-m)
    var(--es-theme-space-padding-m);

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

const Card = forwardRef(
  (
    {
      inset = false,
      centered = false,
      fitContent = false,
      active = false,
      controlScope = ControlScopeEnum.NONE,
      children,
      onAction,
      ...rest
    },
    ref
  ) => {
    return (
      <CardContext.Provider value={{ inset, centered, controlScope }}>
        <StyledCard
          ref={ref}
          fluid
          $inset={inset}
          basis={fitContent ? 'content' : undefined}
          $pointer={controlScope === ControlScopeEnum.ALL}
          $active={active}
          {...rest}
        >
          {children}
        </StyledCard>
      </CardContext.Provider>
    )
  }
)

const CardMedia = ({ image, ...rest }) => {
  const { inset, centered } = useContext(CardContext)
  return (
    <StyledMedia
      fluid
      alignItems={centered ? 'center' : undefined}
      $inset={inset}
      {...rest}
    >
      <Image fluid {...image} />
    </StyledMedia>
  )
}

const CardContent = ({ title, paragraph, media, ...rest }) => {
  const { centered } = useContext(CardContext)
  return (
    <StyledContent fluid>
      <Inline fluid justifyContent="space-between">
        <Stack
          grow={1}
          gap="xs"
          alignItems={centered ? 'center' : undefined}
          {...rest}
        >
          {title && (
            <StyledLabel size="m" align={centered ? 'center' : undefined}>
              {title}
            </StyledLabel>
          )}
          {paragraph && (
            <Text
              size="s"
              variant="tertiary"
              align={centered ? 'center' : undefined}
            >
              {paragraph}
            </Text>
          )}
        </Stack>
        {centered ? null : media}
      </Inline>
    </StyledContent>
  )
}

const CardControl = ({ ...rest }) => {
  const { centered, controlScope } = useContext(CardContext)
  return (
    <StyledControl
      fluid
      alignItems={centered ? 'center' : undefined}
      $pointer={controlScope === ControlScopeEnum.CONTROL}
      {...rest}
    />
  )
}

Card.Media = CardMedia
Card.Content = CardContent
Card.Control = CardControl

export default Card
