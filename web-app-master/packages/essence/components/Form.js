import styled from 'styled-components'

const StyledForm = styled.form`
  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}
`

const Form = ({ fluid = false, submitOnEnter = false, children, ...rest }) => {
  return (
    <StyledForm $fluid={fluid} {...rest}>
      {/* https://stackoverflow.com/questions/477691/submitting-a-form-by-pressing-enter-without-a-submit-button */}
      {submitOnEnter && <input type="submit" hidden />}
      {children}
    </StyledForm>
  )
}

export default Form
