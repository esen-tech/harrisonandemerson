import styled from 'styled-components'

const StyledSpacer = styled.div`
  ${({ $xSize }) => {
    if ($xSize) {
      return `
        width: var(--es-theme-space-margin-${$xSize});
      `
    } else {
      return `
        width: 100%;
      `
    }
  }}

  ${({ $ySize }) => {
    if ($ySize) {
      return `
        height: var(--es-theme-space-margin-${$ySize});
      `
    } else {
      return `
        height: 100%;
      `
    }
  }}
`

const Spacer = ({ xSize = false, ySize = false }) => {
  return <StyledSpacer $xSize={xSize} $ySize={ySize} />
}

export default Spacer
