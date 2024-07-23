import styled from 'styled-components'

const StyledBackdrop = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0);
  visibility: hidden;
  z-index: 10000;

  transition: all 0.15s linear;

  ${({ $show }) => {
    if ($show) {
      return `
        visibility: visible;
        background: rgba(0, 0, 0, 0.5);
      `
    }
  }}
`

const Backdrop = ({ show = false, children, ...rest }) => {
  return (
    <StyledBackdrop $show={show} {...rest}>
      {children}
    </StyledBackdrop>
  )
}

export default Backdrop
