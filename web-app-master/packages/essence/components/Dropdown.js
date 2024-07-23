import { createContext, useContext, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

const StyledDropdown = styled.div`
  position: relative;
`

const StyledDropdownToggle = styled.div``

const StyledDropdownMenu = styled.div`
  position: absolute;
`

const DropdownContext = createContext({})

const Dropdown = ({ isOpen, onToggle, onClose, ...rest }) => {
  const dropdownToggleRef = useRef(null)
  const [_isOpen, _setIsOpen] = useState(null)

  const mergedIsOpen = isOpen === undefined ? _isOpen : isOpen

  if (!onToggle) {
    onToggle = () => {
      _setIsOpen((o) => !o)
    }
  }

  if (!onClose) {
    onClose = () => {
      _setIsOpen(false)
    }
  }

  return (
    <DropdownContext.Provider
      value={{
        isOpen: mergedIsOpen,
        onToggle,
        onClose,
        dropdownToggleRef,
      }}
    >
      <StyledDropdown {...rest} />
    </DropdownContext.Provider>
  )
}

const DropdownToggle = ({ children, ...rest }) => {
  const { isOpen, onToggle, dropdownToggleRef } = useContext(DropdownContext)

  return (
    <StyledDropdownToggle
      ref={dropdownToggleRef}
      onClick={() => onToggle()}
      active={isOpen}
      {...rest}
    >
      {children}
    </StyledDropdownToggle>
  )
}

const DropdownMenu = (props) => {
  const { isOpen, onClose, dropdownToggleRef } = useContext(DropdownContext)
  const dropdownMenuRef = useRef(null)

  useEffect(() => {
    function _handleClickOutside(event) {
      const isInToggle =
        dropdownToggleRef.current &&
        dropdownToggleRef.current.contains(event.target)
      const isInMenu =
        dropdownMenuRef.current &&
        dropdownMenuRef.current.contains(event.target)
      if (!isInToggle && !isInMenu) {
        onClose()
      }
    }
    document.addEventListener('mousedown', _handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', _handleClickOutside)
    }
  }, [dropdownToggleRef, dropdownMenuRef])

  if (!isOpen) {
    return null
  }
  return <StyledDropdownMenu ref={dropdownMenuRef} {...props} />
}

Dropdown.Toggle = DropdownToggle
Dropdown.Menu = DropdownMenu

export default Dropdown
