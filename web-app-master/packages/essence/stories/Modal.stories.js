import { useState } from 'react'
import Button from '../components/Button'
import Modal from '../components/Modal'

export default {
  title: 'Overlay/Modal',
  component: Modal,
  argTypes: {
    backdrop: {
      control: 'boolean',
      defaultValue: true,
    },
    verticallyCentered: {
      control: 'boolean',
      defaultValue: false,
    },
    fullscreen: {
      control: 'boolean',
      defaultValue: false,
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
      <Modal show={isShow} onHide={() => setIsShow(false)} {...args}>
        {children}
      </Modal>
    </>
  )
}
