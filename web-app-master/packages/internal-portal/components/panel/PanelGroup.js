import styled, { css } from 'styled-components'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Panel from './Panel'

const StyledDiv = styled.div`
  margin-bottom: 20px;
  ${(props) => {
    if (props.$display_container) {
      return css`
        border: 1px solid #e4e4e3;
        padding: 24px;
      `
    }
  }}
`

const StyledHeader = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #454340;
  margin-bottom: 20px;
`

const PanelGroup = ({
  panelMeta,
  panelRecordMap,
  fieldMap,
  enumMap,
  onPanelClick,
}) => {
  const panelMetas = panelMeta.children_panel_metas

  return (
    <StyledDiv $display_container={panelMeta.display_container}>
      <Row>
        {panelMeta.name && <StyledHeader>{panelMeta.name}</StyledHeader>}
        {panelMetas
          .sort((a, b) => a.display_sequence - b.display_sequence)
          .map((pm) => (
            <Col key={pm.uuid} xs={pm.display_column_size}>
              {!pm.children_panel_metas ||
              pm.children_panel_metas?.length === 0 ? (
                <Panel
                  panelMeta={pm}
                  panelRecordMap={panelRecordMap}
                  fieldMap={fieldMap}
                  enumMap={enumMap}
                  onPanelClick={onPanelClick}
                />
              ) : (
                <PanelGroup
                  panelMeta={pm}
                  panelRecordMap={panelRecordMap}
                  fieldMap={fieldMap}
                  enumMap={enumMap}
                  onPanelClick={onPanelClick}
                />
              )}
            </Col>
          ))}
      </Row>
    </StyledDiv>
  )
}

export default PanelGroup
