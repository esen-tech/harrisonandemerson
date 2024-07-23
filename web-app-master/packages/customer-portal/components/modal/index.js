import Modal from 'react-bootstrap/Modal'
import styled from 'styled-components'

export const StyledModalHeader = styled(Modal.Header)`
  border-bottom: none;
  padding: 0px;
  box-shadow: 0px 0px 8px rgb(0 0 0 / 25%);
  z-index: 2000;
`

export const StyledModalTitle = styled(Modal.Title)`
  font-size: 18px;
  font-weight: 700;
  color: #171717;
`

export const StyledModalBody = styled(Modal.Body)`
  padding: 0px;
`

export const StyledModalFooter = styled(Modal.Footer)`
  border-top: none;
  padding: 0px;
  box-shadow: 0px 0px 8px rgb(0 0 0 / 25%);
`
