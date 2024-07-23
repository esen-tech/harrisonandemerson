import Dropdown from '@esen/essence/components/Dropdown'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Text from '@esen/essence/components/Text'
import { useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  cursor: pointer;
`

const StyledDropdownMenu = styled(Dropdown.Menu)`
  filter: drop-shadow(4px 4px 20px rgba(0, 0, 0, 0.1));
  background-color: white;
  margin-top: var(--es-theme-space-margin-xs);
  border-radius: var(--es-border-radius-0);
  overflow: hidden;
  left: 0;
  z-index: 1;
`

const StyledSelectOption = styled.div`
  cursor: pointer;
  width: 100%;
  padding: var(--es-theme-space-padding-squished-m);

  ${({ $active }) => {
    if ($active) {
      return `
        color: var(--es-theme-fg-secondary-selected);
        background-color: var(--es-theme-bg-secondary-selected);
      `
    } else {
      return `
        color: var(--es-theme-fg-secondary-default);

        &:hover:not(:disabled) {
          color: var(--es-theme-fg-secondary-hovered);
          background-color: var(--es-theme-bg-secondary-hovered);
        }

        &:active:not(:disabled) {
          color: var(--es-theme-fg-secondary-selected);
          background-color: var(--es-theme-bg-secondary-selected);
        }
      `
    }
  }}
`
const CellDropdownSelect = ({ value, options, onChange }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [activeOption, setActiveOption] = useState()

  const handleMenuItemClick = (option) => {
    setIsDropdownOpen(false)
    if (activeOption.value !== option.value) {
      setActiveOption(option)
      onChange?.(option.value)
    }
  }

  useEffect(() => {
    const option = options?.find((option) => option.value === value)
    if (option !== undefined) {
      setActiveOption(option)
    }
  }, [options, value])

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onToggle={() => setIsDropdownOpen((o) => !o)}
      onClose={() => setIsDropdownOpen(false)}
    >
      <StyledDropdownToggle>
        <Inline justifyContent="space-between" alignItems="center" gap="s">
          <Label size="s" variant="tertiary" pointer>
            {value}
          </Label>
          <Icon size="m" name="arrow_drop_down" />
        </Inline>
      </StyledDropdownToggle>
      <StyledDropdownMenu>
        {options.map((option) => (
          <StyledSelectOption
            key={option.value}
            $active={value === option.value}
            onClick={() => handleMenuItemClick(option)}
          >
            <Text size="s" variant="secondary" wrap={false}>
              {option.label}
            </Text>
          </StyledSelectOption>
        ))}
      </StyledDropdownMenu>
    </Dropdown>
  )
}

export default CellDropdownSelect
