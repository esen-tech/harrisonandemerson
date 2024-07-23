import { forwardRef } from 'react'
import styled from 'styled-components'
import Icon from './Icon'
import Inline from './Inline'

const StyledCheckmarkBlank = styled(Icon)``
const StyledCheckmarkChecked = styled(Icon)``

const StyledCheckbox = styled.label`
  cursor: pointer;

  input {
    display: none;
  }

  ${StyledCheckmarkChecked} {
    display: none;
  }

  input:checked ~ ${StyledCheckmarkBlank} {
    display: none;
  }
  input:checked ~ ${StyledCheckmarkChecked} {
    display: block;
  }
`

const Checkbox = forwardRef(({ children, ...rest }, ref) => {
  return (
    <StyledCheckbox ref={ref}>
      <Inline alignItems="center">
        <input type="checkbox" {...rest} />
        <StyledCheckmarkBlank sizeInPixel={24} name="check_box_outline_blank" />
        <StyledCheckmarkChecked
          sizeInPixel={24}
          variant="info"
          name="check_box"
        />
        {children}
      </Inline>
    </StyledCheckbox>
  )
})

export default Checkbox
