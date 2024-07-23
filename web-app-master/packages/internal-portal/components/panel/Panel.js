import Icon from '@esen/components/Icon'
import {
  FieldRecordDiscriminatorEnum,
  FieldTypeEnum,
} from '@esen/utils/constants/form'
import { InferredSummaryEnum, InferredText } from '@esen/utils/constants/panel'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import BSForm from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import styled, { css } from 'styled-components'

const StyledBSFormLabel = styled(BSForm.Label)`
  font-size: 14px;
  font-weight: 700;
  color: #9d9c9a;
`

const StyledDiv = styled.div`
  ${(props) => {
    if (props.$display_container) {
      return css`
        margin-bottom: 20px;
        border: 1px solid #e4e4e3;
        padding: 24px;
        &:hover {
          outline: 1px solid #1f1e1c;
        }
      `
    }
  }}
  ${(props) => {
    if (props.$hoverable) {
      return css`
        &,
        & * {
          cursor: pointer;
        }
        &:hover ${StyledBSFormLabel} {
          color: #1f1e1c;
        }
      `
    }
  }}
`

const StyledHeader = styled.div`
  font-size: 16px;
  font-weight: bold;
  color: #4d4a47;
  margin-bottom: 32px;
`

const StyledBadge = styled.span`
  display: inline-block;
  margin: 0 10px 10px 0;
  font-size: 12px;
  color: #4d4a47;
  background: #f6f6f6;
  padding: 8px 12px;
  border-radius: 16px;
`

const StyledHeaderWrapper = styled.div`
  position: relative;
`

const StyledPinRightTop = styled.div`
  position: absolute;
  right: 0px;
  top: 0px;
  display: flex;
`

const StyledInferredResult = styled.span`
  display: block;
  font-size: 12px;
  padding: 12px 16px;
  border-radius: 50px;

  ${(props) => {
    if (props.$variant === InferredSummaryEnum.NORMAL) {
      return css`
        color: #198754;
        background: #d1e7dd;
        border: 2px solid #198754;
      `
    } else if (props.$variant === InferredSummaryEnum.ABNORMAL) {
      return css`
        color: #dc3545;
        background: #f8d7da;
        border: 2px solid #dc3545;
      `
    }
  }}
  ${(props) => {
    if (props.$editable) {
      return css`
        cursor: pointer;
      `
    }
  }}
`

const InferredSummary = ({ panelRecords, onInferredSummaryChange }) => {
  const manuallyInferredPanelRecord = panelRecords?.find(
    (pr) => pr.is_manually_inferred
  )
  const ruleInferredPanelRecord = panelRecords?.find(
    (pr) => !pr.is_manually_inferred
  )
  const inferredSummary =
    manuallyInferredPanelRecord?.inferred_summary ||
    ruleInferredPanelRecord?.inferred_summary
  const inferredText = InferredText[inferredSummary]

  if (!inferredText && !manuallyInferredPanelRecord?.remark) {
    return null
  }

  const isEditable = Boolean(onInferredSummaryChange)
  return (
    <StyledPinRightTop>
      {isEditable && inferredText && (
        <Dropdown align="end">
          <Dropdown.Toggle
            as={StyledInferredResult}
            $variant={inferredSummary}
            $editable={isEditable}
          >
            {inferredText}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {Object.values(InferredSummaryEnum)
              .filter((e) => e !== inferredSummary)
              .map((is) => (
                <Dropdown.Item
                  key={is}
                  onClick={() => onInferredSummaryChange(is)}
                >
                  {InferredText[is]}
                </Dropdown.Item>
              ))}
          </Dropdown.Menu>
        </Dropdown>
      )}
      {!isEditable && (
        <>
          {manuallyInferredPanelRecord?.remark && <Icon name="chat_bubble" />}
          {inferredText && (
            <StyledInferredResult $variant={inferredSummary}>
              {inferredText}
            </StyledInferredResult>
          )}
        </>
      )}
    </StyledPinRightTop>
  )
}

const Panel = ({
  panelMeta,
  panelRecordMap,
  fieldMap,
  enumMap,
  onPanelClick,
  onInferredSummaryChange,
}) => {
  const panelRecords = panelRecordMap[panelMeta.uuid]

  return (
    <StyledDiv
      $display_container={panelMeta.display_container}
      $hoverable={Boolean(onPanelClick)}
      onClick={onPanelClick ? () => onPanelClick(panelMeta) : undefined}
    >
      <Row>
        <Col>
          <StyledHeaderWrapper>
            {panelMeta.name ? (
              <StyledHeader>
                {panelMeta.name}
                <InferredSummary
                  panelRecords={panelRecords}
                  onInferredSummaryChange={onInferredSummaryChange}
                />
              </StyledHeader>
            ) : (
              <InferredSummary
                panelRecords={panelRecords}
                onInferredSummaryChange={onInferredSummaryChange}
              />
            )}
          </StyledHeaderWrapper>

          <BSForm>
            {panelMeta.panel_meta_field_metas
              .sort((a, b) => a.display_sequence - b.display_sequence)
              .map((pmfm) => {
                const field_meta = fieldMap[pmfm.field_meta_uuid]?.field_meta
                const field_type = field_meta?.field_type
                const field_records =
                  fieldMap[pmfm.field_meta_uuid]?.field_records
                let fields = []
                if (field_records === undefined || field_records.length === 0) {
                  fields = [<div key="0">N/A</div>]
                } else {
                  if (field_type === FieldTypeEnum.INTEGER) {
                    fields = field_records.map((fr) => (
                      <BSForm.Control
                        key={fr.uuid}
                        type="number"
                        readOnly
                        plaintext
                        value={fr?.integer_value}
                      />
                    ))
                  } else if (field_type === FieldTypeEnum.NUMERIC) {
                    fields = field_records.map((fr) => (
                      <BSForm.Control
                        key={fr.uuid}
                        type="number"
                        readOnly
                        plaintext
                        value={fr?.numeric_value}
                      />
                    ))
                  } else if (field_type === FieldTypeEnum.STRING) {
                    fields = field_records.map((fr) => (
                      <BSForm.Control
                        key={fr.uuid}
                        type="text"
                        readOnly
                        plaintext
                        value={fr.string_value || 'N/A'}
                      />
                    ))
                  } else if (field_type === FieldTypeEnum.TEXT) {
                    fields = field_records.map((fr) => (
                      <BSForm.Control
                        key={fr.uuid}
                        as="textarea"
                        readOnly
                        plaintext
                        rows={fr?.text_value?.split('\n').length}
                        value={fr?.text_value || 'N/A'}
                      />
                    ))
                  } else if (field_type === FieldTypeEnum.ENUM) {
                    const enum_option_map =
                      enumMap[field_meta.enum_option_set_uuid]?.enum_option_map
                    let enum_option_uuid_key
                    let customized_enum_value_key
                    const discriminator = field_records[0]?.discriminator
                    if (
                      discriminator === FieldRecordDiscriminatorEnum.STRING_ENUM
                    ) {
                      enum_option_uuid_key = 'string_enum_option_uuid'
                      customized_enum_value_key = 'customized_string_enum_value'
                    } else if (
                      discriminator ===
                      FieldRecordDiscriminatorEnum.BOOLEAN_ENUM
                    ) {
                      enum_option_uuid_key = 'boolean_enum_option_uuid'
                    } else if (
                      discriminator === FieldRecordDiscriminatorEnum.TIME_ENUM
                    ) {
                      enum_option_uuid_key = 'time_enum_option_uuid'
                      customized_enum_value_key = 'customized_time_enum_value'
                    }
                    fields = (
                      <div>
                        {field_records.map((fr) => {
                          const enum_option =
                            enum_option_map?.[fr[enum_option_uuid_key]]
                          return (
                            <StyledBadge key={fr.uuid} bg="light" text="dark">
                              {enum_option?.name}
                              {enum_option?.is_customization_allowed &&
                                `：${fr[customized_enum_value_key]}`}
                            </StyledBadge>
                          )
                        })}
                      </div>
                    )
                  }
                }
                return (
                  <Row key={pmfm.uuid} className="mb-1">
                    <BSForm.Group as={Col}>
                      <StyledBSFormLabel>
                        {pmfm.display_field_name}
                      </StyledBSFormLabel>
                      {fields}
                    </BSForm.Group>
                  </Row>
                )
              })}
          </BSForm>
        </Col>
      </Row>
    </StyledDiv>
  )
}

export default Panel
