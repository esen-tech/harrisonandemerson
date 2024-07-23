import Icon from '@esen/components/Icon'
import { Children, cloneElement } from 'react'
import Stack from 'react-bootstrap/Stack'
import styled from 'styled-components'

const StyledSpan = styled.span`
  color: #454340;
  font-size: 20px;
  font-weight: bold;
`

const Breadcrumb = ({ children }) => {
  return (
    <Stack direction="horizontal" gap={1}>
      {Children.toArray(children).reduce((arr, child, i, children) => {
        if (i === children.length - 1) {
          return [...arr, cloneElement(child, { key: `child_${i}` })]
        } else {
          return [...arr, child, <Icon key={`sep_${i}`} name="chevron_right" />]
        }
      }, [])}
    </Stack>
  )
}

const BreadcrumbItem = ({ children, ...rest }) => {
  return <StyledSpan {...rest}>{children}</StyledSpan>
}

Breadcrumb.Item = BreadcrumbItem

export default Breadcrumb
