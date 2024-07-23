import { useState } from 'react'
import Button from '../components/Button'
import Offcanvas from '../components/Offcanvas'

export default {
  title: 'Overlay/Offcanvas',
  component: Offcanvas,
  argTypes: {
    backdrop: {
      control: 'boolean',
      defaultValue: true,
    },
    placement: {
      control: 'radio',
      options: ['left', 'right', 'top', 'bottom'],
      defaultValue: 'left',
    },
    children: {
      control: 'text',
      defaultValue: 'Content',
    },
  },
}

export const Template = ({ children, ...args }) => {
  const [isShow, setIsShow] = useState(false)
  return (
    <>
      <Button onClick={() => setIsShow((s) => !s)}>Toggle</Button>
      <Offcanvas show={isShow} onHide={() => setIsShow(false)} {...args}>
        {children}
      </Offcanvas>
    </>
  )
}
