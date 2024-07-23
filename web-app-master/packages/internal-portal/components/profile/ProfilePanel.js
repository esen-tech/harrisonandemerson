import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import BSForm from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import PanelGroup from '../panel/PanelGroup'
import Panel from '../panel/Panel'
import apiAgent from '../../utils/apiAgent'

const ProfilePanel = ({ endUserUUID }) => {
  const upsertPanelRecordForm = useForm()
  const [panel_metas, set_panel_metas] = useState([])
  const [panel_records, set_panel_records] = useState([])
  const [form_metas, set_form_metas] = useState([])
  const [form_records, set_form_records] = useState([])
  const [enum_map, set_enum_map] = useState({})
  const [active_panel_meta, set_active_panel_meta] = useState()

  useEffect(() => {
    async function fetch_panel_metas() {
      await apiAgent.get('/organizations/global/panel_metas', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_panel_metas(data)
        },
      })
    }
    fetch_panel_metas()
  }, [])

  useEffect(() => {
    async function fetch_panel_records() {
      await apiAgent.get(`/end_users/${endUserUUID}/panel_records`, {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_panel_records(data)
        },
      })
    }
    if (endUserUUID) {
      fetch_panel_records()
    }
  }, [endUserUUID])

  useEffect(() => {
    async function fetch_profile_form_metas() {
      await apiAgent.get('/profile_form_metas', {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_form_metas(data)
        },
      })
    }
    if (endUserUUID) {
      fetch_profile_form_metas()
    }
  }, [])

  useEffect(() => {
    const enum_option_set_uuid_set = new Set()
    form_metas.forEach((form_meta) => {
      form_meta.field_metas.forEach((field_meta) => {
        if (field_meta.enum_option_set_uuid) {
          enum_option_set_uuid_set.add(field_meta.enum_option_set_uuid)
        }
      })
    })
    async function fetch_enums() {
      await apiAgent.get('/enums', {
        params: {
          query: {
            enum_option_set_uuids: Array.from(enum_option_set_uuid_set),
          },
        },
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          const map = data.reduce(
            (m, enu) => ({
              ...m,
              [enu.enum_option_set.uuid]: {
                ...enu,
                enum_option_map: enu.enum_options.reduce(
                  (m, eo) => ({
                    ...m,
                    [eo.uuid]: eo,
                  }),
                  {}
                ),
              },
            }),
            {}
          )
          set_enum_map(map)
        },
      })
    }
    fetch_enums()
  }, [form_metas])

  useEffect(() => {
    async function fetch_profile_form_records() {
      await apiAgent.get(`/profiles/${endUserUUID}/form_records`, {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          set_form_records(data.form_records)
        },
      })
    }
    if (endUserUUID) {
      fetch_profile_form_records()
    }
  }, [endUserUUID])

  const handleSubmitUpsertPanelRecordForm = async (payload, panelMetaUUID) => {
    const panelRecords = panelRecordMap[panelMetaUUID]
    const manuallyInferredPanelRecord = panelRecords?.find(
      (pr) => pr.is_manually_inferred
    )

    if (!manuallyInferredPanelRecord) {
      // create
      await apiAgent.post(
        `/panel_metas/${panelMetaUUID}/panel_records`,
        {
          end_user_uuid: endUserUUID,
          ...payload,
        },
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_panel_records([...panel_records, data])
          },
        }
      )
    } else {
      // update
      await apiAgent.patch(
        `/panel_metas/${panelMetaUUID}/panel_records/${manuallyInferredPanelRecord.uuid}`,
        {
          end_user_uuid: endUserUUID,
          ...payload,
        },
        {
          onFail: (status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            const idx = panel_records.findIndex((pr) => pr.uuid === data.uuid)
            set_panel_records([
              ...panel_records.slice(0, idx),
              data,
              ...panel_records.slice(idx + 1),
            ])
          },
        }
      )
    }
  }

  const panelRecordMap = panel_records.reduce((m, panel_record) => {
    if (!(panel_record.panel_meta_uuid in m)) {
      m[panel_record.panel_meta_uuid] = []
    }
    m[panel_record.panel_meta_uuid] = [
      ...m[panel_record.panel_meta_uuid],
      panel_record,
    ]
    return m
  }, {})

  const fieldMetaMap = form_metas.reduce(
    (m, form_meta) => ({
      ...m,
      ...form_meta.field_metas.reduce(
        (m, field_meta) => ({
          ...m,
          [field_meta.uuid]: field_meta,
        }),
        {}
      ),
    }),
    {}
  )
  const fieldRecordMap = form_records.reduce(
    (m, form_record) => ({
      ...m,
      ...form_record.field_records.reduce((m, field_record) => {
        if (!(field_record.field_meta_uuid in m)) {
          m[field_record.field_meta_uuid] = []
        }
        m[field_record.field_meta_uuid].push(field_record)
        return m
      }, {}),
    }),
    {}
  )
  const fieldMap = Object.keys(fieldMetaMap).reduce(
    (m, fieldMetaUUID) => ({
      ...m,
      [fieldMetaUUID]: {
        field_meta: fieldMetaMap[fieldMetaUUID],
        field_records: fieldRecordMap[fieldMetaUUID] || [],
      },
    }),
    {}
  )

  return (
    <Container fluid className="py-4">
      <PanelGroup
        panelMeta={{
          children_panel_metas: panel_metas,
        }}
        panelRecordMap={panelRecordMap}
        fieldMap={fieldMap}
        enumMap={enum_map}
        onPanelClick={(panelMeta) => {
          const panelRecords = panelRecordMap[panelMeta.uuid]
          const manuallyInferredPanelRecord = panelRecords?.find(
            (pr) => pr.is_manually_inferred
          )

          upsertPanelRecordForm.reset({
            remark: manuallyInferredPanelRecord?.remark,
          })
          set_active_panel_meta(panelMeta)
        }}
      />

      <Modal
        show={active_panel_meta !== undefined}
        onHide={() => set_active_panel_meta(undefined)}
        centered
      >
        <Modal.Body>
          {active_panel_meta && (
            <Panel
              panelMeta={{
                ...active_panel_meta,
                display_container: false,
              }}
              panelRecordMap={panelRecordMap}
              fieldMap={fieldMap}
              enumMap={enum_map}
              onInferredSummaryChange={(inferredSummary) => {
                handleSubmitUpsertPanelRecordForm(
                  { inferred_summary: inferredSummary },
                  active_panel_meta.uuid
                )
              }}
            />
          )}
          <BSForm>
            <Row className="my-3">
              <BSForm.Group as={Col}>
                <BSForm.Label>紀錄筆記</BSForm.Label>
                <BSForm.Control
                  as="textarea"
                  rows={5}
                  placeholder="紀錄這個症狀的內容"
                  {...upsertPanelRecordForm.register('remark')}
                />
              </BSForm.Group>
            </Row>
          </BSForm>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => set_active_panel_meta(undefined)}
          >
            取消
          </Button>
          <Button
            variant="dark"
            onClick={() => {
              upsertPanelRecordForm.handleSubmit(
                handleSubmitUpsertPanelRecordForm
              )(active_panel_meta.uuid)
              set_active_panel_meta(undefined)
            }}
          >
            儲存
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ProfilePanel
