import styled from 'styled-components'

const StyledGrid = styled.div`
  display: grid;
  max-width: 100%;

  ${({ $columns, $columnGap, $rowGap }) => {
    return `
      grid-template-columns: repeat(${$columns}, 1fr);
      grid-column-gap: var(--es-theme-space-margin-${$columnGap});
      grid-row-gap: var(--es-theme-space-margin-${$rowGap});
    `
  }}

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
      `
    }
  }}

  & > * {
    min-width: 0;
    min-height: 0;
  }
`

const StyledGridArea = styled.div`
  ${({ $columnOffset }) => {
    if ($columnOffset) {
      return `
        grid-column-start: ${$columnOffset};
      `
    }
  }}
  ${({ $columnSpan }) => {
    if ($columnSpan) {
      return `
        grid-column-end: span ${$columnSpan};
      `
    }
  }}
  ${({ $rowOffset }) => {
    if ($rowOffset) {
      return `
        grid-row-start: ${$rowOffset};
      `
    }
  }}
  ${({ $rowSpan }) => {
    if ($rowSpan) {
      return `
        grid-row-end: span ${$rowSpan};
      `
    }
  }}
  ${({ $alignSelf }) => {
    if ($alignSelf) {
      return `
        align-self: ${$alignSelf};
      `
    }
  }}
  ${({ $justifySelf }) => {
    if ($justifySelf) {
      return `
        justify-self: ${$justifySelf};
      `
    }
  }}
`

// https://www.casper.tw/css/2017/03/22/css-grid-layout/
const GridArea = ({
  columnOffset,
  columnSpan,
  rowOffset,
  rowSpan,
  alignSelf,
  justifySelf,
  ...rest
}) => {
  return (
    <StyledGridArea
      $columnOffset={columnOffset}
      $columnSpan={columnSpan}
      $rowOffset={rowOffset}
      $rowSpan={rowSpan}
      $alignSelf={alignSelf}
      $justifySelf={justifySelf}
      {...rest}
    />
  )
}

const Grid = ({ fluid = false, columnGap, rowGap, columns, ...rest }) => {
  return (
    <StyledGrid
      $fluid={fluid}
      $columnGap={columnGap}
      $rowGap={rowGap}
      $columns={columns}
      {...rest}
    />
  )
}

Grid.Area = GridArea

export default Grid
