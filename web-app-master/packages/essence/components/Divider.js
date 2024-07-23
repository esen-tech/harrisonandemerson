import styled from 'styled-components'

const StyledDiv = styled.div`
  width: 100%;
  padding: var(--es-theme-space-margin-s) var(--es-theme-space-margin-l);

  ${({ $indention }) => {
    switch ($indention) {
      case 'all': {
        return `
          padding: var(--es-theme-space-margin-s) var(--es-theme-space-margin-l);
        `
      }
      case 'left': {
        return `
          padding-left: var(--es-theme-space-margin-l);
          padding-right: 0;
        `
      }
      case 'right': {
        return `
          padding-left: 0;
          padding-right: var(--es-theme-space-margin-l);
        `
      }
      case 'x': {
        return `
          padding: 0 var(--es-theme-space-margin-l);
        `
      }
      case 'y': {
        return `
          padding: var(--es-theme-space-margin-s) 0;
        `
      }
    }
  }}
`

const StyledDivider = styled.hr`
  margin: 0;
  height: 0;
  width: 100%;
  border: none;

  ${({ $variant }) => {
    return `
      border-top: 2px solid var(--es-theme-border-${$variant}-default);
    `
  }}
`

const Divider = ({ variant = 'primary', indention = false }) => {
  if (indention === false) {
    return <StyledDivider $variant={variant} />
  }
  return (
    <StyledDiv $indention={indention}>
      <StyledDivider $variant={variant} $indention={indention} />
    </StyledDiv>
  )
}

export default Divider
