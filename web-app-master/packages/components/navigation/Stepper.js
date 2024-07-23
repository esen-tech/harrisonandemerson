import { Children, cloneElement, createContext, useContext } from 'react'
import styled, { css } from 'styled-components'


const StyledProgress = styled.ul`
  list-style-type: none;
  display: flex;
  margin: 0;
  padding: 0;
  gap: 8px;
`

const StyledProgressItem = styled.li`
  flex: 1;
  height: 4px;

  ${props => (
    props.$active ? css`
      background: #4D4A47;
    ` : css`
      background: #CAC9C8;
    `
  )}
`

const StyledDotProgress = styled.ul`
  list-style-type: none;
  display: flex;
  margin: 0;
  padding: 0;
  justify-content: center;
`

const StyledDotProgressItem = styled.li`
  height: 8px;
  width: 8px;
  border-radius: 50%;
  margin: 4px;

  ${props => (
    props.$active ? css`
      background: #4D4A47;
    ` : css`
      background: #CAC9C8;
    `
  )}
`

const StepperContext = createContext({})

const Stepper = ({ activeStep, children }) => {
  const childrenArr = Children.toArray(children)

  return (
    <StepperContext.Provider
      value={{
        activeStep,
        stepCount: childrenArr.length,
      }}
    >
      {
        childrenArr
          .filter((_, i) => i === activeStep)
          .map(child => cloneElement(child))
      }
    </StepperContext.Provider>
  )
}

const StripProgress = (props) => {
  const { activeStep, stepCount } = useContext(StepperContext)

  return (
    <StyledProgress {...props}>
      {new Array(stepCount).fill(0).map((_, i) => (
        <StyledProgressItem key={i} $active={i <= activeStep} />
      ))}
    </StyledProgress>
  )
}

const DotProgress = (props) => {
  const { activeStep, stepCount } = useContext(StepperContext)

  return (
    <StyledDotProgress {...props}>
      {new Array(stepCount).fill(0).map((_, i) => (
        <StyledDotProgressItem key={i} $active={i === activeStep} />
      ))}
    </StyledDotProgress>
  )
}

const Step = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  )
}

const Control = ({ children, ...rest }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

Stepper.Step = Step
Stepper.StripProgress = StripProgress
Stepper.DotProgress = DotProgress
Stepper.Control = Control

export default Stepper
