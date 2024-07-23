import ViewValue from './ViewValue'

const ViewField = ({ field_meta, field_records }) => {
  if (field_meta.is_multiple_record) {
    if (field_records.length === 0) {
      return 'N/A'
    }
    return (
      <ul>
        {field_records.map(field_record => (
          <li key={field_record.id}>
            <ViewValue
              field_meta={field_meta}
              record_value={field_record.value}
            />
          </li>
        ))}
      </ul>
    )
  } else {
    return (
      <ViewValue
        field_meta={field_meta}
        record_value={field_records[0]?.value}
      />
    )
  }
}

export default ViewField
