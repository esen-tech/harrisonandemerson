import { forwardRef } from 'react'
import Input from './Input'

const Textarea = forwardRef(({ type, ...rest }, ref) => {
  return <Input ref={ref} as="textarea" {...rest} />
})

export default Textarea
