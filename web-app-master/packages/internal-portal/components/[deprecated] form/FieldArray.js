import { useFieldArray } from 'react-hook-form'
import { FieldTypeEnum } from '../../constants/form'
import Field from './Field'
import ViewValue from './ViewValue'

const FieldArray = ({ control, register, field_meta, enum_options }) => {
  const { fields, insert, remove } = useFieldArray({ control, name: `${field_meta.id}` })
  const handleInsertRow = (index) => {
    insert(index, null)
  }
  const handleRemoveRow = (index) => {
    remove(index)
  }
  if (field_meta.field_type === FieldTypeEnum.ENUM) {
    return (
      <fieldset>
        {enum_options?.map(enum_option => (
          <label key={enum_option.id}>
            <input
              {...register(`${field_meta.id}`)}
              type="checkbox"
              value={enum_option.id}
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
    return (
      <ul>
        {fields.length === 0 && (
          <li>
            <button type="button" onClick={() => handleInsertRow(0)}>新增</button>
          </li>
        )}
        {fields.map((field, index) => (
          <li key={field.id}>
            <Field field_meta={field_meta} {...register(`${field_meta.id}[${index}]`)} />
            <button type="button" onClick={() => handleInsertRow(index)}>在上方新增</button>
            <button type="button" onClick={() => handleInsertRow(index + 1)}>在下方新增</button>
            <button type="button" onClick={() => handleRemoveRow(index)}>移除</button>
          </li>
        ))}
      </ul>
    )
  }
}

export default FieldArray
