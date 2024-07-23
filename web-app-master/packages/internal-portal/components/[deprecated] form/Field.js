import { useState } from 'react'
import { API_HOST } from '../../utils/config'
import { FieldTypeEnum } from '../../constants/form'
import ViewValue from '../../components/form/ViewValue'

const Field = React.forwardRef(({ register, field_meta, enum_options, ...rest }, ref) => {
  const { field_type } = field_meta
  const [ reference_options, set_reference_options ] = useState([])
  const handleFetchReferenceOptions = async (e) => {
    const res = await fetch(`${API_HOST}/references/${field_meta.reference_option_set_id}`, { credentials: 'include' })
    const { data } = await res.json()
    set_reference_options(data.reference_options)
  }
  let field
  let props = {}
  if (register) {
    props = register(`${field_meta.id}`) // register field internally
  } else {
    props = rest // register field by external
  }
  if (field_type === FieldTypeEnum.INTEGER) {
    field = <input type="number" step="1" ref={ref} {...props} />
  } else if (field_type === FieldTypeEnum.NUMERIC) {
    field = <input type="text" ref={ref} {...props} />
  } else if (field_type === FieldTypeEnum.STRING) {
    field = <input type="text" ref={ref} {...props} />
  } else if (field_type === FieldTypeEnum.TEXT) {
    field = <textarea ref={ref} {...props} />
  } else if (field_type === FieldTypeEnum.DATE_TIME) {
    field = <input type="datetime-local" ref={ref} {...props} />
  } else if (field_type === FieldTypeEnum.REFERENCE) {
    field = (
      <select ref={ref} {...props} defaultValue="" onClick={handleFetchReferenceOptions}>
        <option value="" disabled>請選擇</option>
        {reference_options?.map(reference_option => (
          <option key={reference_option.id} value={reference_option.id}>
            {reference_option.slug}
          </option>
        ))}
      </select>
    )
  } else if (field_type === FieldTypeEnum.ENUM) {
    field = (
      <fieldset>
        {enum_options?.map(enum_option => (
          <label key={enum_option.id}>
            <input
              type="radio"
              value={enum_option.id}
              {...props}
            />
            <ViewValue
              field_meta={field_meta}
              record_value={enum_option.value}
            />
          </label>
        ))}
      </fieldset>
    )
  } else {
    field = <span>N/A</span>
  }
  return field
})

export default Field
