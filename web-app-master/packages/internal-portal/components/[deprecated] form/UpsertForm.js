import { format, addMinutes } from 'date-fns'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { API_HOST } from '../../utils/config'
import { selectors as orgSelectors } from '../../ducks/organization'
import { FieldTypeEnum } from '../../constants/form'
import Field from './Field'
import FieldArray from './FieldArray'

const UpsertForm = ({ legend, visit, ...rest }) => {
  const router = useRouter()
  const organization = useSelector(orgSelectors.getOrganization)
  const [ form_metas, set_form_metas ] = useState([])
  const [ form_meta_id, set_form_meta_id ] = useState()
  const [ field_metas, set_field_metas ] = useState([])
  const [ enum_map, set_enum_map ] = useState({})
  const { control, register, handleSubmit } = useForm()

  useEffect(async () => {
    if (organization?.id === undefined) {
      return
    }
    const res = await fetch(`${API_HOST}/organizations/${organization.id}/form_metas`, { credentials: 'include' })
    const { data } = await res.json()
    set_form_metas(data)
  }, [organization?.id])

  const handleFormMetaChange = async (e) => {
    const form_meta_id = e.target.value
    const res = await fetch(`${API_HOST}/form_metas/${form_meta_id}/field_metas`, { credentials: 'include' })
    const { data } = await res.json()
    set_form_meta_id(form_meta_id)
    set_field_metas(data)
  }

  useEffect(() => {
    const requestedEnumIds = new Set()
    field_metas.forEach(async (field_meta) => {
      if (field_meta.field_type === "ENUM" && !requestedEnumIds.has(field_meta.enum_option_set_id)) {
        requestedEnumIds.add(field_meta.enum_option_set_id)
        const res = await fetch(`${API_HOST}/enums/${field_meta.enum_option_set_id}`, { credentials: 'include' })
        const { data } = await res.json()
        set_enum_map(enum_map => ({
          ...enum_map,
          [data.enum_option_set.id]: data.enum_options,
        }))
      }
    })
  }, [field_metas])

  const handleSubmitForm = async (formData) => {
    const is_valid_value = (v) => (v !== undefined && v !== null && v !== '')
    const get_enum_option_value_by_id = (field_meta, enum_option_id) => {
      const enum_options = enum_map[field_meta.enum_option_set_id]
      const enum_option = enum_options.find(eo => eo.id === enum_option_id)
      return enum_option.value
    }
    const field_records = []
    const field_meta_map = field_metas.reduce((map, field_meta) => ({
      ...map,
      [field_meta.id]: field_meta
    }), {})
    Object.keys(formData).filter(field_meta_id => field_meta_id in field_meta_map).forEach(field_meta_id => {
      const field_meta = field_meta_map[field_meta_id]

      if (field_meta.is_multiple_record) {
        const values = formData[field_meta_id]
        if (field_meta.field_type === FieldTypeEnum.ENUM) {
          values.filter(is_valid_value).forEach(value => {
            field_records.push({
              field_meta_id,
              model: field_meta.field_record_model,
              value: get_enum_option_value_by_id(field_meta, parseInt(value)),
            })
          })
        } else if (field_meta.field_type === FieldTypeEnum.DATE_TIME) {
          values.filter(is_valid_value).forEach(value => {
            const date = new Date(value)
            field_records.push({
              field_meta_id,
              model: field_meta.field_record_model,
              value: format(addMinutes(date, date.getTimezoneOffset()), 'yyyy-MM-dd HH:mm:ss'),
            })
          })
        } else {
          values.filter(is_valid_value).forEach(value => {
            field_records.push({
              field_meta_id,
              model: field_meta.field_record_model,
              value,
            })
          })
        }
      } else {
        const value = formData[field_meta_id]
        if (!is_valid_value(value)) {
          return
        }
        if (field_meta.field_type === FieldTypeEnum.ENUM) {
          field_records.push({
            field_meta_id,
            model: field_meta.field_record_model,
            value: get_enum_option_value_by_id(field_meta, parseInt(value)),
          })
        } else if (field_meta.field_type === FieldTypeEnum.DATE_TIME) {
          const date = new Date(value)
          field_records.push({
            field_meta_id,
            model: field_meta.field_record_model,
            value: format(addMinutes(date, date.getTimezoneOffset()), 'yyyy-MM-dd HH:mm:ss'),
          })
        } else {
          field_records.push({
            field_meta_id,
            model: field_meta.field_record_model,
            value,
          })
        }
      }
    })
    const payload = {
      form_meta_id,
      field_records,
    }
    await fetch(`${API_HOST}/visits/${visit.id}/form_records`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    router.reload()
  }

  return (
    <form {...rest}>
      <p>
        {legend}
        <select defaultValue="" onChange={handleFormMetaChange}>
          <option value="" disabled>請選擇</option>
          {form_metas.map(form_meta => (
            <option key={form_meta.id} value={form_meta.id}>
              {form_meta.form_name}
            </option>
          ))}
        </select>
      </p>
      {field_metas.map(field_meta => {
        const enum_options = enum_map[field_meta.enum_option_set_id]
        return (
          <React.Fragment key={field_meta.id}>
            <label>
              {field_meta.field_name}
              {field_meta.is_field_required && '*'}
              ：
            </label>
            {field_meta.is_multiple_record ? (
              <FieldArray
                control={control}
                register={register}
                field_meta={field_meta}
                enum_options={enum_options}
              />
            ) : (
              <Field
                register={register}
                field_meta={field_meta}
                enum_options={enum_options}
              />
            )}
            <br />
          </React.Fragment>
        )
      })}
      {form_meta_id && (
        <button onClick={handleSubmit(handleSubmitForm)}>
          建立活動
        </button>
      )}
    </form>
  )
}

export default UpsertForm
