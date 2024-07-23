import Icon from '@esen/essence/components/Icon'
import Label from '@esen/essence/components/Label'
import styled from 'styled-components'
import Navbar from './Navbar'

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const StyledAction = styled(Label)`
  user-select: none;

  ${({ $disabled }) => {
    if ($disabled) {
      return `
        pointer-events: none;
      `
    } else {
      return `
        cursor: pointer;
      `
    }
  }}
`

const PageNavbar = ({ onBack, ...rest }) => {
  return (
    <Navbar
      leftAction={
        onBack ? (
          <StyledIcon
            name="arrow_back"
            sizeInPixel={24}
            onClick={() => onBack()}
          />
        ) : (
          false
        )
      }
      rightAction={false}
      {...rest}
    />
  )
}

const PageNavbarAction = ({ disabled, ...rest }) => {
  return (
    <StyledAction
      size="xs"
      variant={disabled ? 'tertiary' : 'primary'}
      $disabled={disabled}
      {...rest}
    />
  )
}

PageNavbar.Action = PageNavbarAction

export default PageNavbar
