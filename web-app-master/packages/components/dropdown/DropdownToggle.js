import { forwardRef } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'


const CustomDropdownToggle = forwardRef(({ children, onClick }, ref) => (
  <span
    ref={ref}
    style={{ cursor: 'pointer' }}
    onClick={(e) => {
      e.preventDefault()
      onClick(e)
    }}
  >
    {children}
  </span>
))

const DropdownToggle = (props) => {
  return (
    <Dropdown.Toggle as={CustomDropdownToggle} {...props} />
  )
}

export default DropdownToggle
