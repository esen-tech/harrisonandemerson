import styled from 'styled-components'

const Fill = styled.div`
  width: 100%;
  height: 100%;
`

const Center = ({ children }) => {
  return (
    <Fill className="d-flex justify-content-center align-items-center">
      <div>{children}</div>
    </Fill>
  )
}

export default Center
