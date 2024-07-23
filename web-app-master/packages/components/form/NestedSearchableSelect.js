import Icon from '@esen/components/Icon'
import { useEffect, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import styled from 'styled-components'

const StyledDropdownToggle = styled(Dropdown.Toggle)`
  white-space: normal;
`

const SearchInputWrapper = styled.div`
  position: sticky;
  top: 0;
  background: #fff;
`

const StyledDropdownMenu = styled(Dropdown.Menu)`
  max-height: 300px;
  overflow-y: auto;
  padding-top: 0px;
`

const StyledDropdownItem = styled(Dropdown.Item)`
  white-space: normal;
`

const NestedSearchableSelect = ({ title, getOptions, onChange }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [activeOption, setActiveOption] = useState()
  const [parentOptions, setParentOptions] = useState([])
  const [isGettingOptions, setIsGettingOptions] = useState(false)
  const [options, setOptions] = useState([])
  const [query, setQuery] = useState('')
  const lastParentOption = parentOptions.at(-1)

  const updateOptions = (options) => {
    setOptions(options)
    setIsGettingOptions(false)
  }

  useEffect(() => {
    setIsGettingOptions(true)
    getOptions(query, lastParentOption, updateOptions)
  }, [query, lastParentOption])

  const handleItemClick = (option) => {
    if (option.isLeaf) {
      setActiveOption(option)
      onChange && onChange(option.value)
      setShowMenu(false)
    } else {
      setParentOptions([...parentOptions, option])
    }
  }

  const handleBackClick = () => {
    setParentOptions([...parentOptions.slice(0, -1)])
  }

  return (
    <Dropdown
      align="start"
      show={showMenu}
      onToggle={(nextShow, meta) => {
        if (meta.source === 'click') {
          setShowMenu(nextShow)
        }
        if (meta.source === 'rootClose') {
          setShowMenu(nextShow)
        }
      }}
    >
      <StyledDropdownToggle variant="light">
        {activeOption ? activeOption.label : title}
      </StyledDropdownToggle>

      <StyledDropdownMenu>
        <SearchInputWrapper className="d-grid">
          <Form.Control
            autoFocus
            className="mx-3 my-2 w-auto"
            placeholder="搜尋"
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
          {lastParentOption && (
            <>
              <StyledDropdownItem onClick={handleBackClick}>
                <Icon name="arrow_back" /> 返回上層
              </StyledDropdownItem>
              <Dropdown.Divider />
            </>
          )}
        </SearchInputWrapper>
        {isGettingOptions ? (
          <Dropdown.Header>
            <Spinner animation="border" />
          </Dropdown.Header>
        ) : options.length === 0 ? (
          <Dropdown.Header>查無結果</Dropdown.Header>
        ) : (
          options.map((option) => (
            <StyledDropdownItem
              key={option.key}
              active={option.value === activeOption?.value}
              onClick={() => handleItemClick(option)}
            >
              {option.label}
            </StyledDropdownItem>
          ))
        )}
      </StyledDropdownMenu>
    </Dropdown>
  )
}

export default NestedSearchableSelect
