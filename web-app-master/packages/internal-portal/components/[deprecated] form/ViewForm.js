import ViewField from './ViewField'

const ViewForm = ({ form_meta, field_metas, field_records, ...rest }) => {
  const field_meta_map = form_meta.field_metas.reduce((map, fm) => ({ ...map, [fm.id]: fm }), {})
  const record_map = field_metas.reduce((map, fm) => ({ ...map, [fm.id]: [] }), {})
  field_records.forEach(field_record => {
    record_map[field_record.field_meta_id].push(field_record)
  })

  return (
    <table border="1" {...rest}>
      <tbody>
        {Object.entries(record_map).map(([ field_meta_id, field_records ]) => {
          const field_meta = field_meta_map[field_meta_id]
          return (
            <tr key={field_meta_id}>
              <th>{field_meta.field_name}</th>
              <td>
                <ViewField
                  field_meta={field_meta}
                  field_records={field_records}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ViewForm
