import { useRef } from 'react'
import styled from 'styled-components'
import Backdrop from './Backdrop'
import Flex from './Flex'
import ReactPortal from './ReactPortal'

const StyledPositioner = styled(Flex)`
  visibility: hidden;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: all 0.3s ease-out;
  transform: translateY(-50px);
  z-index: 10001;

  ${({ $show }) => {
    if ($show) {
      return `
        visibility: visible;
        transform: none;
      `
    }
  }}
`

const StyledModal = styled.div`
  background-color: var(--es-white);

  ${({ $fullscreen, $verticallyCentered }) => {
    if ($fullscreen) {
      return `
        margin: 0;
        width: 100%;
        height: 100%;
      `
    } else if ($verticallyCentered) {
      return `
        margin: auto var(--es-theme-space-margin-xxl);
      `
    } else {
      return `
        margin: var(--es-theme-space-margin-xxl);
      `
    }
  }}
`

const Modal = ({
  show,
  onHide,
  backdrop = true,
  verticallyCentered = false,
  fullscreen = false,
  children,
  ...rest
}) => {
  const modalRef = useRef(null)

  const handleHide = () => {
    onHide?.()
  }

  return (
    <ReactPortal>
      {backdrop && <Backdrop show={show} />}
      <StyledPositioner
        justifyContent="center"
        onClick={(e) => {
          const isInModal =
            modalRef.current && modalRef.current.contains(e.target)
          if (!isInModal) {
            handleHide()
          }
        }}
        $show={show}
      >
        <StyledModal
          ref={modalRef}
          $fullscreen={fullscreen}
          $verticallyCentered={verticallyCentered}
          {...rest}
        >
          {children}
        </StyledModal>
      </StyledPositioner>
    </ReactPortal>
  )
}

export default Modal
