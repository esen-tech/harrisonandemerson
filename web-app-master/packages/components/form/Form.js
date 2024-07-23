import { createContext, forwardRef, useContext, useEffect, useImperativeHandle } from 'react'
import { useForm } from 'react-hook-form'
import BSForm from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import InputGroup from 'react-bootstrap/InputGroup'
import { FieldTypeEnum, FieldRecordDiscriminatorEnum, EnumDiscriminatorEnum, VisibilityConditionDependentTypeEnum, VisibilityConditionDiscriminatorEnum } from '@esen/utils/constants/form'
import { normalize_field, denormalize_field } from '@esen/utils/functions/form'
import { zipToObject } from '@esen/utils/functions/zip'


export const getDefaultValues = (formMeta, formRecord) => {
  const defaultValues = {}
  const fieldMetaMap = formMeta.field_metas.reduce((m, fm) => ({...m, [fm.uuid]: fm}), {})
  formRecord?.field_records.forEach(field_record => {
    const field_meta = fieldMetaMap[field_record.field_meta_uuid]
    if (field_meta.is_multiple_record) {
      if (field_record.discriminator === FieldRecordDiscriminatorEnum.STRING_ENUM) {
        if (!defaultValues[field_meta.uuid]) {
          defaultValues[field_meta.uuid] = {
            discriminator: field_record.discriminator,
            string_enum_option_uuids: [],
            customized_string_enum_value_map: {},
          }
        }
        defaultValues[field_meta.uuid].string_enum_option_uuids.push(`${field_record.string_enum_option_uuid}`)
        defaultValues[field_meta.uuid].customized_string_enum_value_map[`${field_record.string_enum_option_uuid}`] = field_record.customized_string_enum_value
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.BOOLEAN_ENUM) {
        if (!defaultValues[field_meta.uuid]) {
          defaultValues[field_meta.uuid] = {
            discriminator: field_record.discriminator,
            boolean_enum_option_uuids: [],
          }
        }
        defaultValues[field_meta.uuid].boolean_enum_option_uuids.push(`${field_record.boolean_enum_option_uuid}`)
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.TIME_ENUM) {
        if (!defaultValues[field_meta.uuid]) {
          defaultValues[field_meta.uuid] = {
            discriminator: field_record.discriminator,
            time_enum_option_uuids: [],
          }
        }
        defaultValues[field_meta.uuid].time_enum_option_uuids.push(`${field_record.time_enum_option_uuid}`)
      }
    } else {
      if (field_record.discriminator === FieldRecordDiscriminatorEnum.STRING_ENUM) {
        defaultValues[field_meta.uuid] = {
          discriminator: field_record.discriminator,
          string_enum_option_uuid: `${field_record.string_enum_option_uuid}`,
        }
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.BOOLEAN_ENUM) {
        defaultValues[field_meta.uuid] = {
          discriminator: field_record.discriminator,
          boolean_enum_option_uuid: `${field_record.boolean_enum_option_uuid}`,
        }
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.TIME_ENUM) {
        defaultValues[field_meta.uuid] = {
          discriminator: field_record.discriminator,
          time_enum_option_uuid: `${field_record.time_enum_option_uuid}`,
        }
      } else {
        defaultValues[field_meta.uuid] = denormalize_field(field_meta, field_record)
      }
    }
  })
  return defaultValues
}

export const getFieldVisibilityMap = (fieldMetas, values) => {
  const fieldVisibilityMap = fieldMetas.reduce((m, fieldMeta) => {
    const { visibility_condition } = fieldMeta
    if (!visibility_condition) {
      m[fieldMeta.uuid] = true
    } else {
      const watchField = values[visibility_condition.dependent_field_meta_uuid]
      let leftOperand = null
      let rightOperand = null
      let evaluatedResult = null
      if (visibility_condition.discriminator === VisibilityConditionDiscriminatorEnum.BOOLEAN_ENUM) {
        leftOperand = watchField?.boolean_enum_option_uuid
        rightOperand = `${visibility_condition.dependent_boolean_enum_option_uuid}`
      }
      if (leftOperand === undefined) {
        m[fieldMeta.uuid] = true
      } else if (visibility_condition.dependent_type === VisibilityConditionDependentTypeEnum.IS) {
        evaluatedResult = leftOperand === rightOperand
        m[fieldMeta.uuid] = evaluatedResult
      }
    }
    return m
  }, {})
  return fieldVisibilityMap
}

export const getFieldRecords = (formMeta, values) => {
  const fieldMetaMap = formMeta.field_metas.reduce((m, fm) => ({...m, [fm.uuid]: fm}), {})
  const field_records = []
  for (let field_meta_uuid in values) {
    const field_record = {
      field_meta_uuid,
      ...values[field_meta_uuid],
    }

    // handle dirty fields only
    const field_meta = fieldMetaMap[field_meta_uuid]
    if (field_meta.field_type === FieldTypeEnum.INTEGER && field_record.integer_value === "") {
      continue
    } else if (field_meta.field_type === FieldTypeEnum.NUMERIC && field_record.numeric_value === "") {
      continue
    } else if (field_meta.field_type === FieldTypeEnum.ENUM) {
      if (field_record.discriminator === FieldRecordDiscriminatorEnum.BOOLEAN_ENUM && !field_record.boolean_enum_option_uuid && !field_record.boolean_enum_option_uuids) {
        continue
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.STRING_ENUM && !field_record.string_enum_option_uuid && !field_record.string_enum_option_uuids) {
        continue
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.TIME_ENUM && !field_record.time_enum_option_uuid && !field_record.time_enum_option_uuids) {
        continue
      }
    }

    // resolve plural
    if (field_meta.is_multiple_record) {
      if (field_record.discriminator === FieldRecordDiscriminatorEnum.STRING_ENUM) {
        (field_record.string_enum_option_uuids || []).forEach(string_enum_option_uuid => {
          field_records.push({
            field_meta_uuid: field_record.field_meta_uuid,
            discriminator: field_record.discriminator,
            string_enum_option_uuid,
            customized_string_enum_value: field_record?.customized_string_enum_value_map?.[string_enum_option_uuid],
          })
        })
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.BOOLEAN_ENUM) {
        (field_record.boolean_enum_option_uuids || []).forEach(boolean_enum_option_uuid => {
          field_records.push({
            field_meta_uuid: field_record.field_meta_uuid,
            discriminator: field_record.discriminator,
            boolean_enum_option_uuid,
          })
        })
      } else if (field_record.discriminator === FieldRecordDiscriminatorEnum.TIME_ENUM) {
        (field_record.time_enum_option_uuids || []).forEach(time_enum_option_uuid => {
          field_records.push({
            field_meta_uuid: field_record.field_meta_uuid,
            discriminator: field_record.discriminator,
            time_enum_option_uuid,
          })
        })
      }
    } else { // resolve singular
      // normalization
      field_record = normalize_field(field_meta, field_record)

      field_records.push(field_record)
    }
  }
  return field_records
}

const FormContext = createContext({})

const Form = forwardRef(({ formMeta, enumMap, formRecord, onVisibilityChange, children }, ref) => {
  const fieldMetas = formMeta.field_metas
  const defaultValues = getDefaultValues(formMeta, formRecord)
  const form = useForm({ defaultValues })
  const dependentFieldMetaUUIDs = Array.from(fieldMetas.reduce((s, fm) => {
    const { visibility_condition } = fm
    if (visibility_condition) {
      s.add(`${visibility_condition.dependent_field_meta_uuid}`)
    }
    return s
  }, new Set()))
  const watchFields = zipToObject(dependentFieldMetaUUIDs, form.watch(dependentFieldMetaUUIDs))

  useEffect(() => {
    if (!onVisibilityChange) {
      return
    }
    const fieldVisibilityMap = getFieldVisibilityMap(fieldMetas, watchFields)
    onVisibilityChange(fieldVisibilityMap)
  }, [JSON.stringify(watchFields)])

  useImperativeHandle(ref, () => ({
    getForm() {
      return form
    },
  }))

  return (
    <FormContext.Provider value={{ form, enumMap, fieldMetas, formRecord }}>
      <BSForm>
        {children}
      </BSForm>
    </FormContext.Provider>
  )
})

const WritableField = ({ field_meta }) => {
  const { form, enumMap } = useContext(FormContext)
  const { field_type, prefix, suffix, is_multiple_record } = field_meta
  let field = null
  let field_record_discriminator_value = null

  if (field_type === FieldTypeEnum.INTEGER) {
    field = (
      <InputGroup>
        {prefix && (
          <InputGroup.Text>
            {prefix}
          </InputGroup.Text>
        )}
        <BSForm.Control
          type="number"
          inputMode="numeric"
          placeholder={field_meta.placeholder}
          {...form.register(`${field_meta.uuid}.integer_value`)}
        />
        {suffix && (
          <InputGroup.Text>
            {suffix}
          </InputGroup.Text>
        )}
      </InputGroup>
    )
    field_record_discriminator_value = FieldRecordDiscriminatorEnum.INTEGER
  } else if (field_type === FieldTypeEnum.NUMERIC) {
    field = (
      <InputGroup>
        {prefix && (
          <InputGroup.Text>
            {prefix}
          </InputGroup.Text>
        )}
        <BSForm.Control
          type="number"
          inputMode="decimal"
          placeholder={field_meta.placeholder}
          {...form.register(`${field_meta.uuid}.numeric_value`)}
        />
        {suffix && (
          <InputGroup.Text>
            {suffix}
          </InputGroup.Text>
        )}
      </InputGroup>
    )
    field_record_discriminator_value = FieldRecordDiscriminatorEnum.NUMERIC
  } else if (field_type === FieldTypeEnum.STRING) {
    field = (
      <BSForm.Control
        type="text"
        placeholder={field_meta.placeholder}
        {...form.register(`${field_meta.uuid}.string_value`)}
      />
    )
    field_record_discriminator_value = FieldRecordDiscriminatorEnum.STRING
  } else if (field_type === FieldTypeEnum.TEXT) {
    field = (
      <BSForm.Control
        as="textarea"
        rows={5}
        placeholder={field_meta.placeholder}
        {...form.register(`${field_meta.uuid}.text_value`)}
      />
    )
    field_record_discriminator_value = FieldRecordDiscriminatorEnum.TEXT
  } else if (field_type === FieldTypeEnum.ENUM) {
    const { enum_option_set, enum_options } = enumMap[field_meta.enum_option_set_uuid]
    const inputType = is_multiple_record ? 'checkbox' : 'radio'
    if (enum_option_set.discriminator === EnumDiscriminatorEnum.BOOLEAN) {
      field = (
        enum_options.map(enum_option => (
          <BSForm.Check
            key={enum_option.uuid}
            type={inputType}
            id={enum_option.uuid}
            label={`${enum_option.name}`}
            value={enum_option.uuid}
            {...form.register(is_multiple_record ? `${field_meta.uuid}.boolean_enum_option_uuids` : `${field_meta.uuid}.boolean_enum_option_uuid`)}
          />
        ))
      )
      field_record_discriminator_value = FieldRecordDiscriminatorEnum.BOOLEAN_ENUM
    } else if (enum_option_set.discriminator === EnumDiscriminatorEnum.STRING) {
      const watchEnumOptionIds = form.watch(`${field_meta.uuid}.string_enum_option_uuids`)
      field = (
        enum_options.map(enum_option => (
          <BSForm.Check
            key={enum_option.uuid}
            id={enum_option.uuid}
          >
            <BSForm.Check.Input
              value={enum_option.uuid}
              type={inputType}
              {...form.register(is_multiple_record ? `${field_meta.uuid}.string_enum_option_uuids` : `${field_meta.uuid}.string_enum_option_uuid`)}
            />
            <BSForm.Check.Label>
              {enum_option.name}
              {enum_option.is_customization_allowed && (
                <BSForm.Control
                  type="text"
                  disabled={!watchEnumOptionIds?.includes?.(`${enum_option.uuid}`)}
                  {...form.register(`${field_meta.uuid}.customized_string_enum_value_map.${enum_option.uuid}`)}
                />
              )}
            </BSForm.Check.Label>
          </BSForm.Check>
        ))
      )
      field_record_discriminator_value = FieldRecordDiscriminatorEnum.STRING_ENUM
    } else if (enum_option_set.discriminator === EnumDiscriminatorEnum.TIME) {
      field = (
        enum_options.map(enum_option => (
          <BSForm.Check
            key={enum_option.uuid}
            type={inputType}
            id={enum_option.uuid}
            label={enum_option.name}
            value={enum_option.uuid}
            {...form.register(is_multiple_record ? `${field_meta.uuid}.time_enum_option_uuids` : `${field_meta.uuid}.time_enum_option_uuid`)}
          />
        ))
      )
      field_record_discriminator_value = FieldRecordDiscriminatorEnum.TIME_ENUM
    }
  }
  return (
    <>
      <input
        type="hidden"
        value={field_record_discriminator_value}
        {...form.register(`${field_meta.uuid}.discriminator`)}
      />
      {field}
    </>
  )
}

const WritableFieldGroup = ({ fieldMetas }) => {
  return (
    fieldMetas.map(field_meta => (
      <Row className="mb-3" key={field_meta.uuid}>
        <BSForm.Group as={Col}>
          <BSForm.Label>
            {field_meta.field_name}
            {field_meta.is_field_required && '*'}
          </BSForm.Label>
          <WritableField field_meta={field_meta} />
        </BSForm.Group>
      </Row>
    ))
  )
}

const ReadonlyField = ({ fieldMeta, fieldRecord }) => {
  const { field_type, prefix, suffix } = fieldMeta
  const field_record = denormalize_field(fieldMeta, fieldRecord)
  let field = null

  if (field_type === FieldTypeEnum.INTEGER) {
    field = (
      <InputGroup>
        {prefix && (
          <InputGroup.Text>
            {prefix}
          </InputGroup.Text>
        )}
        <BSForm.Control
          type="number"
          readOnly
          value={field_record?.integer_value}
        />
        {suffix && (
          <InputGroup.Text>
            {suffix}
          </InputGroup.Text>
        )}
      </InputGroup>
    )
  } else if (field_type === FieldTypeEnum.NUMERIC) {
    field = (
      <InputGroup>
        {prefix && (
          <InputGroup.Text>
            {prefix}
          </InputGroup.Text>
        )}
        <BSForm.Control
          type="number"
          readOnly
          value={field_record?.numeric_value}
        />
        {suffix && (
          <InputGroup.Text>
            {suffix}
          </InputGroup.Text>
        )}
      </InputGroup>
    )
  } else if (field_type === FieldTypeEnum.STRING) {
    field = (
      <BSForm.Control
        type="text"
        readOnly
        value={field_record?.string_value || 'N/A'}
      />
    )
  } else if (field_type === FieldTypeEnum.TEXT) {
    field = (
      <BSForm.Control
        as="textarea"
        readOnly
        rows={field_record?.text_value?.split('\n').length}
        value={field_record?.text_value || 'N/A'}
      />
    )
  }
  return field
}

const ReadonlyFieldGroup = ({ fieldMetas }) => {
  const { formRecord } = useContext(FormContext)
  const fieldRecordMap = formRecord.field_records.reduce((m, fr) => ({...m, [fr.field_meta_uuid]: fr}), {})

  return (
    fieldMetas.map(fieldMeta => (
      <Row className="mb-3" key={fieldMeta.uuid}>
        <BSForm.Group as={Col}>
          <BSForm.Label>
            {fieldMeta.field_name}
            {fieldMeta.is_field_required && '*'}
          </BSForm.Label>
          <ReadonlyField
            fieldMeta={fieldMeta}
            fieldRecord={fieldRecordMap[fieldMeta.uuid]}
          />
        </BSForm.Group>
      </Row>
    ))
  )
}

Form.WritableFieldGroup = WritableFieldGroup
Form.ReadonlyFieldGroup = ReadonlyFieldGroup

export default Form
