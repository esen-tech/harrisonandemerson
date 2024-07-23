import Icon from '@esen/essence/components/Icon'
import styled from 'styled-components'
import Navbar from './Navbar'

const StyledNavbar = styled(Navbar)`
  position: sticky;
  top: 0;
  z-index: 1;
`

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const ModalNavbar = ({ onBack, onDismiss, ...rest }) => {
  return (
    <StyledNavbar
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
      rightAction={
        onDismiss ? (
          <StyledIcon
            name="close"
            sizeInPixel={24}
            onClick={() => onDismiss()}
          />
        ) : (
          false
        )
      }
      {...rest}
    />
  )
}

export default ModalNavbar
