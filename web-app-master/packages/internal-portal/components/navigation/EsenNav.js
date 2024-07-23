import styled from 'styled-components'
import Nav from 'react-bootstrap/Nav'


const EsenNav = styled(Nav)`
  .nav-link {
    color: #4D4A47;
    &.active {
      background: #F6F6F6;
    }
  }
  .dropdown-item {
    &.active, &:active {
      color: inherit;
      background-color: #F6F6F6;
    }
  }
`

export default EsenNav
