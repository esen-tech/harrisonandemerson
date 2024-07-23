import isEqual from 'lodash/isEqual'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Badge from './Badge'
import Dropdown from './Dropdown'
import Flex from './Flex'
import Icon from './Icon'
import Inline from './Inline'
import Text from './Text'

const variantPaletteMap = {
  primary: 'primary',
  secondary: 'primary',
  tertiary: 'primary',
}

const StyledDropdown = styled(Dropdown)`
  max-width: 100%;
  min-width: 0;

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    } else {
      return `
        display: inline-block;
      `
    }
  }}
`

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  border-radius: var(--es-border-radius-0);
  user-select: none;

  max-width: 100%;
  min-width: 0;

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    } else {
      return `
        display: inline-block;
      `
    }
  }}

  ${({ $size }) => {
    return `
      padding: var(--es-theme-space-padding-squished-${$size});
    `
  }}

  ${({ $variant, disabled, $active }) => {
    const palette = variantPaletteMap[$variant] || $variant

    if (disabled) {
      return `
        pointer-events: none;
        color: var(--es-theme-fg-${palette}-disabled);
        background-color: var(--es-white);
        border: 1px solid var(--es-theme-border-${palette}-disabled);
      `
    } else if ($active) {
      return `
        cursor: pointer;
        color: var(--es-theme-fg-${palette}-selected);
        // background-color: var(--es-theme-bg-${palette}-selected);
        border: 1px solid var(--es-theme-border-${palette}-selected);
      `
    } else {
      return `
        cursor: pointer;
        color: var(--es-theme-fg-${palette}-default);
        // background-color: var(--es-theme-bg-${palette}-default);
        border: 1px solid var(--es-theme-border-${palette}-default);

        &:hover:not(:disabled) {
          color: var(--es-theme-fg-${palette}-hovered);
          // background-color: var(--es-theme-bg-${palette}-hovered);
          border: 1px solid var(--es-theme-border-${palette}-hovered);
        }

        &:active:not(:disabled) {
          color: var(--es-theme-fg-${palette}-selected);
          // background-color: var(--es-theme-bg-${palette}-selected);
          border: 1px solid var(--es-theme-border-${palette}-selected);
        }
      `
    }
  }}
`

const StyledText = styled(Text)`
  ${({ disabled, $variant, $placeholder }) => {
    if (disabled) {
      return ''
    }
    if ($placeholder) {
      return `
        color: var(--es-neutral-500);
      `
    } else {
      const palette = variantPaletteMap[$variant] || $variant
      return `
        color: var(--es-theme-fg-${palette}-default);
      `
    }
  }}
`

const StyledDropdownMenu = styled(Dropdown.Menu)`
  filter: drop-shadow(4px 4px 20px rgba(0, 0, 0, 0.1));
  background-color: white;
  margin-top: var(--es-theme-space-margin-xs);

  ${({ $align }) => {
    switch ($align) {
      case 'left': {
        return `
          left: 0;
        `
      }
      case 'right': {
        return `
          right: 0;
        `
      }
    }
  }}

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}
`

const StyledSelectOption = styled.div`
  cursor: pointer;
  width: 100%;

  ${({ $size }) => {
    return `
      padding: var(--es-theme-space-padding-squished-${$size});
    `
  }}

  ${({ $variant, $active }) => {
    const variantPaletteMap = {
      primary: 'secondary',
      secondary: 'secondary',
      tertiary: 'secondary',
    }
    const palette = variantPaletteMap[$variant] || $variant
    if ($active) {
      return `
        color: var(--es-theme-fg-${palette}-selected);
        background-color: var(--es-theme-bg-${palette}-selected);
      `
    } else {
      return `
        color: var(--es-theme-fg-${palette}-default);

        &:hover:not(:disabled) {
          color: var(--es-theme-fg-${palette}-hovered);
          background-color: var(--es-theme-bg-${palette}-hovered);
        }

        &:active:not(:disabled) {
          color: var(--es-theme-fg-${palette}-selected);
          background-color: var(--es-theme-bg-${palette}-selected);
        }
      `
    }
  }}
`

const DropdownSelect = ({
  value,
  onChange,
  size = 'm',
  placeholder,
  options,
  getOptions,
  disabled = false,
  variant = 'primary',
  fluid = false,
  align = 'left',
  multiple = false,
  ...rest
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isGettingOptions, setIsGettingOptions] = useState(false)
  const [_options, setOptions] = useState([])
  const [activeOption, setActiveOption] = useState()
  const [activeOptions, setActiveOptions] = useState([])

  const handleMenuItemClick = (option) => {
    if (multiple) {
      setActiveOptions([...activeOptions, option])
    } else {
      setIsDropdownOpen(false)
      if (activeOption?.value !== option.value) {
        setActiveOption(option)
        onChange?.(option.value)
      }
    }
  }

  useEffect(() => {
    if (multiple) {
      onChange?.(activeOptions.map((opt) => opt.value))
    }
  }, [activeOptions])

  useEffect(() => {
    setOptions(options)
  }, [options])

  useEffect(() => {
    if (!multiple) {
      const option = _options?.find((option) => option.value === value)
      if (option !== undefined) {
        setActiveOption(option)
      } else {
        setActiveOption()
      }
    } else {
      if (
        !isEqual(new Set(value), new Set(activeOptions.map((o) => o.value)))
      ) {
        const options = _options?.filter((option) =>
          value?.includes(option.value)
        )
        setActiveOptions(options)
      }
    }
  }, [_options, value])

  useEffect(() => {
    const _receiveOptions = (options) => {
      setOptions(options)
      setIsGettingOptions(false)
    }
    setIsGettingOptions(true)
    getOptions?.(_receiveOptions)
  }, [])

  const removeActiveOption = (option) => {
    const idx = activeOptions.findIndex((opt) => opt.value === option.value)
    setActiveOptions([
      ...activeOptions.slice(0, idx),
      ...activeOptions.slice(idx + 1),
    ])
  }

  return (
    <StyledDropdown
      isOpen={isDropdownOpen}
      $fluid={fluid}
      onToggle={() => setIsDropdownOpen((o) => !o)}
      onClose={() => setIsDropdownOpen(false)}
      {...rest}
    >
      <StyledDropdownToggle
        disabled={disabled}
        $variant={variant}
        $active={isDropdownOpen}
        $fluid={fluid}
        $size={size}
      >
        <Flex alignItems="center" justifyContent="space-between" gap="s">
          {multiple ? (
            <Inline gap="s" wrap="wrap">
              {activeOptions.map((option) => (
                <Badge key={option.value}>
                  {option.label}
                  <Icon
                    name="close"
                    pointer
                    onClick={(e) => {
                      e.stopPropagation()
                      removeActiveOption(option)
                    }}
                  />
                </Badge>
              ))}
            </Inline>
          ) : (
            <StyledText
              size={size}
              truncated
              disabled={disabled}
              $variant={variant}
              $placeholder={activeOption === undefined}
            >
              {activeOption ? activeOption.label : placeholder}
            </StyledText>
          )}
          <Icon size={size} name="expand_more" />
        </Flex>
      </StyledDropdownToggle>
      <StyledDropdownMenu $align={align} $fluid={fluid}>
        <Flex direction="column">
          {_options
            ?.filter((option) => {
              if (multiple) {
                return !activeOptions.find((opt) => opt.value === option.value)
              } else {
                return true
              }
            })
            .map((option) => (
              <StyledSelectOption
                key={option.value}
                $size={size}
                $variant={variant}
                $active={option.value === activeOption?.value}
                onClick={() => handleMenuItemClick(option)}
              >
                <Text size={size}>{option.label}</Text>
              </StyledSelectOption>
            ))}
        </Flex>
      </StyledDropdownMenu>
    </StyledDropdown>
  )
}

export default DropdownSelect
