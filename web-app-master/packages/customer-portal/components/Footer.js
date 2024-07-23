import styled from 'styled-components'

const StyledFooter = styled.div`
  width: 100%;
  padding: var(--es-theme-space-margin-l) var(--es-theme-space-margin-l)
    var(--es-theme-space-padding-xxl) var(--es-theme-space-margin-l);
`

const Footer = (props) => {
  return <StyledFooter {...props} />
}

export default Footer
