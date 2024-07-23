import { forwardRef } from 'react'
import styled from 'styled-components'
import Flex from './Flex'

const StyledTr = styled.tr`
  height: 1px; // https://stackoverflow.com/questions/3215553/make-a-div-fill-an-entire-table-cell

  ${({ $pointer }) => {
    if ($pointer) {
      return `
        cursor: pointer;
      `
    }
  }}
`

const StyledTh = styled.th`
  height: inherit;

  ${({ $leftSticky }) => {
    if ($leftSticky) {
      return `
        position: sticky;
        left: 0px;
        z-index: 1;
      `
    }
  }}

  ${({ $disabled }) => {
    if ($disabled) {
      return `
        background-color: var(--es-theme-bg-primary-disabled);
      `
    } else {
      return `
        background-color: var(--es-theme-bg-primary-default);
      `
    }
  }}
`

const StyledCell = styled(Flex)`
  height: 48px;
  border-bottom: 1px solid var(--es-theme-border-primary-default);
  align-items: center;
  padding: var(--es-theme-space-margin-m);

  ${({ $borderRight }) => {
    if ($borderRight) {
      return `
        border-right: 1px solid var(--es-theme-border-primary-default);
      `
    }
  }}

  ${({ $leftIndent }) => {
    if ($leftIndent) {
      return `
        margin-left: var(--es-theme-space-margin-m);
      `
    }
  }}

  ${({ $rightIndent }) => {
    if ($rightIndent) {
      return `
        margin-right: var(--es-theme-space-margin-m);
      `
    }
  }}
`

const StyledTd = styled.td`
  height: inherit;

  ${({ $leftSticky }) => {
    if ($leftSticky) {
      return `
        position: sticky;
        left: 0px;
      `
    }
  }}

  ${({ $disabled }) => {
    if ($disabled) {
      return `
        background-color: var(--es-theme-bg-primary-disabled);
      `
    } else {
      return `
        background-color: var(--es-theme-bg-primary-default);
      `
    }
  }}

  ${({ $transparent }) => {
    if ($transparent) {
      return `
        background-color: transparent;
      `
    }
  }}
`

const StyledTable = styled.table`
  border-collapse: collapse;

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}

  tfoot td * {
    border: none;
  }
`

const Tr = forwardRef(({ pointer, children, ...rest }, ref) => {
  return (
    <StyledTr ref={ref} $pointer={pointer} {...rest}>
      {children}
    </StyledTr>
  )
})

const Th = ({
  borderRight = false,
  leftIndent = false,
  rightIndent = false,
  leftSticky = false,
  disabled = false,
  customized = false,
  children,
  ...rest
}) => {
  return (
    <StyledTh $leftSticky={leftSticky} $disabled={disabled} {...rest}>
      {customized ? (
        children
      ) : (
        <StyledCell
          $borderRight={borderRight}
          $leftIndent={leftIndent}
          $rightIndent={rightIndent}
        >
          {children}
        </StyledCell>
      )}
    </StyledTh>
  )
}

const Td = ({
  borderRight,
  leftIndent,
  rightIndent,
  leftSticky,
  transparent,
  disabled,
  crossRow,
  customized = false,
  children,
  ...rest
}) => {
  return (
    <StyledTd
      $leftSticky={leftSticky}
      $disabled={disabled}
      $transparent={transparent}
      colSpan={crossRow ? '100%' : undefined}
    >
      {customized ? (
        children
      ) : (
        <StyledCell
          $borderRight={borderRight}
          $leftIndent={leftIndent}
          $rightIndent={rightIndent}
          {...rest}
        >
          {children}
        </StyledCell>
      )}
    </StyledTd>
  )
}

const Table = ({ fluid = false, ...rest }) => {
  return <StyledTable $fluid={fluid} {...rest} />
}

Table.Tr = Tr
Table.Th = Th
Table.Td = Td

export default Table
