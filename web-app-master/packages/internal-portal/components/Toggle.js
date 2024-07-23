import Icon from '@esen/components/Icon'
import { Children, cloneElement, useState } from 'react'
import Navbar from 'react-bootstrap/Navbar'

const Toggle = ({ open, children }) => {
  const [is_open, set_is_open] = useState(open)
  return Children.toArray(children).map((child, i) =>
    cloneElement(child, {
      is_open,
      set_is_open,
    })
  )
}

const ToggleHeader = ({ is_open, set_is_open, title, right }) => {
  return (
    <Navbar className="pb-3">
      <Navbar.Text
        style={{ cursor: 'pointer' }}
        onClick={() => set_is_open((open) => !open)}
      >
        {is_open ? (
          <Icon name="arrow_drop_down" />
        ) : (
          <Icon name="arrow_right" />
        )}{' '}
        {title}
      </Navbar.Text>
      {right && (
        <Navbar.Collapse className="justify-content-end">
          {right}
        </Navbar.Collapse>
      )}
    </Navbar>
  )
}

const ToggleBody = ({ is_open, children }) => {
  return is_open ? children : null
}

Toggle.Header = ToggleHeader
Toggle.Body = ToggleBody

export default Toggle
