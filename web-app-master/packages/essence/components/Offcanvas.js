import styled from 'styled-components'
import Backdrop from './Backdrop'
import ReactPortal from './ReactPortal'

const StyledOffcanvas = styled.div`
  transition: transform 0.3s ease-in-out;
  position: fixed;
  background-color: var(--es-white);
  z-index: 10002;

  ${({ $placement }) => {
    switch ($placement) {
      case 'left': {
        return `
          transform: translateX(-100%);
          left: 0;
          top: 0;
          bottom: 0;
        `
      }
      case 'right': {
        return `
          transform: translateX(100%);
          right: 0;
          top: 0;
          bottom: 0;
        `
      }
      case 'top': {
        return `
          transform: translateY(-100%);
          top: 0;
          left: 0;
          right: 0;
        `
      }
      case 'bottom': {
        return `
          transform: translateY(100%);
          bottom: 0;
          left: 0;
          right: 0;
        `
      }
    }
  }}

  ${({ $show }) => {
    if ($show) {
      return `
        transform: none;
      `
    }
  }}
`

const Offcanvas = ({
  show,
  onHide,
  backdrop = true,
  placement = 'left',
  children,
  ...rest
}) => {
  const handleHide = () => {
    onHide?.()
  }

  return (
    <ReactPortal>
      {backdrop && <Backdrop show={show} onClick={handleHide} />}
      <StyledOffcanvas $show={show} $placement={placement} {...rest}>
        {children}
      </StyledOffcanvas>
    </ReactPortal>
  )
}

export default Offcanvas
