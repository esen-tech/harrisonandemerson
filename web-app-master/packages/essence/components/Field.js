import styled from 'styled-components'

const StyledField = styled.div`
  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}
`

const Field = ({ fluid = false, ...rest }) => {
  return <StyledField $fluid={fluid} {...rest} />
}

export default Field
