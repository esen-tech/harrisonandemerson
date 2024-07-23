import { useState } from 'react'
import { format, subMinutes } from 'date-fns'
import { API_HOST } from '../../utils/config'
import { FieldTypeEnum } from '../../constants/form'

const ViewValue = ({ field_meta, record_value }) => {
  const [ reference_option_slug, set_reference_option_slug ] = useState()
  const { field_type } = field_meta
  const handleLoadReferenceOptionSlug = async (e) => {
    const res = await fetch(`${API_HOST}/references/${field_meta.reference_option_set_id}`, { credentials: 'include' })
    const { data } = await res.json()
    const reference_option = data.reference_options.find(reference_option => reference_option.id === parseInt(record_value))
    set_reference_option_slug(reference_option.slug)
  }

  if (record_value === undefined) {
    return 'N/A'
  }
  if (field_type === FieldTypeEnum.INTEGER) {
    return record_value
  } else if (field_type === FieldTypeEnum.NUMERIC) {
    return record_value
  } else if (field_type === FieldTypeEnum.STRING) {
    return record_value
  } else if (field_type === FieldTypeEnum.TEXT) {
    return (
      <>
        {record_value.split('\n').map((str, i) => <p key={i}>{str}</p>)}
      </>
    )
  } else if (field_type === FieldTypeEnum.DATE_TIME) {
    const date = new Date(record_value)
    return `${format(subMinutes(date, date.getTimezoneOffset()), 'yyyy-MM-dd HH:mm:ss')} (當地時間)`
  } else if (field_type === FieldTypeEnum.ENUM) {
    if (record_value === true) {
      return 'Yes'
    } else if (record_value === false) {
      return 'No'
    } else {
      return record_value
    }
  } else if (field_type === FieldTypeEnum.REFERENCE) {
    if (reference_option_slug !== undefined) {
      return reference_option_slug
    } else {
      return (
        <button onClick={handleLoadReferenceOptionSlug}>
          讀取參照代號 {record_value} 的內容
        </button>
      )
    }
  }
}

export default ViewValue
