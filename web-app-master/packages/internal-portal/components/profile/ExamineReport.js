import DropdownToggle from '@esen/components/dropdown/DropdownToggle'
import Icon from '@esen/components/Icon'
import Justify from '@esen/components/layout/Justify'
import Breadcrumb from '@esen/components/navigation/Breadcrum'
import { get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useAttachmentManager } from '@esen/utils/hooks/attachment'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Dropdown from 'react-bootstrap/Dropdown'
import BSForm from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import { harrisonApiAgent } from '../../utils/apiAgent'
import ActiveExamineReport from './ActiveExamineReport'
import AttachmentUpload from './AttachmentUpload'

const FormTypes = {
  CREATE_FOLDER: 'CREATE_FOLDER',
  UPLOAD_FILES_TO_FOLDER: 'UPLOAD_FILES_TO_FOLDER',
}

const StyledTr = styled.tr`
  cursor: pointer;
`

const ExamineReport = ({ endUserReference }) => {
  const router = useRouter()
  const { organization } = useCurrentOrganization()
  const createForm = useForm({
    defaultValues: { formType: FormTypes.CREATE_FOLDER },
  })
  const createFolderForm = useForm()
  const uploadFiledToFolderForm = useForm()
  const paginator = usePaginator()
  const [examination_reports, set_examination_reports] = useState([])
  const [
    active_examination_report_reference,
    set_active_examination_report_reference,
  ] = useState()
  const [show_create_form_modal, set_show_create_form_modal] = useState(false)
  const attachmentManager = useAttachmentManager(
    async (attachment, onSuccess, onFail) => {
      if (!examinationReportReference) {
        return
      }
      const formData = new FormData()
      formData.append('upload_file', attachment.file)
      await harrisonApiAgent.post(
        `/emr/organizations/${organization.reference}/end_users/${router.query.profile_uuid}/examination_reports/${examinationReportReference}/files`,
        formData,
        {
          onError: (_err) => {
            onFail()
          },
          onFail: (_status, _data) => {
            onFail()
          },
          onSuccess: (data) => {
            onSuccess(data)
          },
        }
      )
    }
  )

  const watchCreateFormFormType = createForm.watch('formType')
  const examinationReportReference = uploadFiledToFolderForm.watch(
    'examination_report_reference'
  )

  useEffect(() => {
    async function fetch_end_user_examination_reports() {
      await harrisonApiAgent.get(
        `/emr/organizations/${organization.reference}/end_users/${endUserReference}/examination_reports`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_examination_reports(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization && endUserReference) {
      fetch_end_user_examination_reports()
    }
  }, [organization, endUserReference, paginator.activePageToken])

  const handleSubmitCreateFolderForm = async (payload) => {
    await harrisonApiAgent.post(
      `/emr/organizations/${organization.reference}/end_users/${endUserReference}/examination_reports`,
      {
        organization_reference: organization.reference,
        file_group: {
          display_name: payload.display_name,
        },
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  const handleDeleteExamininationReport = async (examinationReport) => {
    await harrisonApiAgent.delete(
      `/emr/organizations/${organization.reference}/end_users/${endUserReference}/examination_reports/${examinationReport.reference}`,
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.reload()
        },
      }
    )
  }

  const activeExamineReport = examination_reports.find(
    (er) => er.reference === active_examination_report_reference
  )

  return (
    <Container fluid className="py-4">
      {activeExamineReport ? (
        <ActiveExamineReport
          examineReport={activeExamineReport}
          onClearExamineReportId={() =>
            set_active_examination_report_reference(undefined)
          }
        />
      ) : (
        <>
          <Justify className="mb-3">
            <Breadcrumb>
              <Breadcrumb.Item>檔案列表</Breadcrumb.Item>
            </Breadcrumb>
            <Button
              variant="dark"
              onClick={() => {
                createFolderForm.reset()
                set_show_create_form_modal(true)
              }}
            >
              <Icon name="add" /> 新增
            </Button>
          </Justify>
          <Table bordered hover>
            <thead>
              <tr>
                <th>資料夾名稱</th>
                <th>建立日期</th>
              </tr>
            </thead>
            <tbody>
              {examination_reports.length === 0 ? (
                <tr>
                  <td colSpan={2}>沒有資料夾。</td>
                </tr>
              ) : (
                examination_reports.map((er) => (
                  <StyledTr
                    key={er.reference}
                    onClick={() =>
                      set_active_examination_report_reference(er.reference)
                    }
                  >
                    <td>
                      <Icon name="folder" /> {er.file_group.display_name}
                    </td>
                    <td>
                      <Justify>
                        <span>
                          {get_local_datetime(
                            er.file_group.create_time,
                            'yyyy-MM-dd'
                          )}
                        </span>
                        <Dropdown
                          align="end"
                          variant="light"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <DropdownToggle>
                            <Icon name="more_vert" />
                          </DropdownToggle>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              onClick={(e) => {
                                handleDeleteExamininationReport(er)
                              }}
                            >
                              刪除
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </Justify>
                    </td>
                  </StyledTr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <Justify>
                    <span>
                      Rows per page: {paginator.activePage?.count_per_page}
                    </span>
                    <span>
                      Total: {paginator.activePage?.count_all_page}
                      <Button
                        size="sm"
                        variant="light"
                        className="mx-2"
                        disabled={paginator.isPrevDisabled()}
                        onClick={paginator.goPrev}
                      >
                        <Icon name="chevron_left" />
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        disabled={paginator.isNextDisabled(
                          (defaultIsNextDisabled, previousPages) => {
                            const isLastPage =
                              previousPages.length *
                                (paginator.activePage?.count_per_page || 0) +
                                examination_reports.length ===
                              paginator.activePage?.count_all_page
                            return defaultIsNextDisabled || isLastPage
                          }
                        )}
                        onClick={paginator.goNext}
                      >
                        <Icon name="chevron_right" />
                      </Button>
                    </span>
                  </Justify>
                </td>
              </tr>
            </tfoot>
          </Table>
        </>
      )}

      <Modal
        show={show_create_form_modal}
        onHide={() => set_show_create_form_modal(false)}
        backdrop="static"
        scrollable
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>新增檢測檔案</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <BSForm>
            <Row className="mb-3">
              <BSForm.Group as={Col}>
                <BSForm.Label>選擇動作</BSForm.Label>
                <div>
                  <BSForm.Check
                    inline
                    type="radio"
                    id={FormTypes.CREATE_FOLDER}
                    label="新增資料夾"
                    value={FormTypes.CREATE_FOLDER}
                    {...createForm.register('formType')}
                  />
                  <BSForm.Check
                    inline
                    disabled={examination_reports.length === 0}
                    type="radio"
                    id={FormTypes.UPLOAD_FILES_TO_FOLDER}
                    label="上傳檔案"
                    value={FormTypes.UPLOAD_FILES_TO_FOLDER}
                    onClick={() => attachmentManager.reset()}
                    {...createForm.register('formType')}
                  />
                </div>
              </BSForm.Group>
            </Row>
          </BSForm>
          {watchCreateFormFormType === FormTypes.CREATE_FOLDER && (
            <BSForm>
              <Row className="mb-3">
                <BSForm.Group as={Col}>
                  <BSForm.Label>命名資料夾</BSForm.Label>
                  <BSForm.Control
                    type="text"
                    placeholder="輸入名字"
                    {...createFolderForm.register('display_name')}
                  />
                </BSForm.Group>
              </Row>
            </BSForm>
          )}
          {watchCreateFormFormType === FormTypes.UPLOAD_FILES_TO_FOLDER && (
            <BSForm>
              <Row className="mb-3">
                <BSForm.Group as={Col}>
                  <BSForm.Label>選擇資料夾</BSForm.Label>
                  <BSForm.Select
                    {...uploadFiledToFolderForm.register(
                      'examination_report_reference'
                    )}
                  >
                    {examination_reports.map((er) => (
                      <option key={er.reference} value={er.reference}>
                        {er.file_group.display_name}
                      </option>
                    ))}
                  </BSForm.Select>
                </BSForm.Group>
              </Row>
              <BSForm.Group as={Col}>
                <BSForm.Label>上傳檔案</BSForm.Label>
                <AttachmentUpload attachmentManager={attachmentManager} />
              </BSForm.Group>
            </BSForm>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={() => set_show_create_form_modal(false)}
          >
            關閉
          </Button>
          <Button
            variant="dark"
            onClick={async () => {
              if (watchCreateFormFormType === FormTypes.CREATE_FOLDER) {
                await createFolderForm.handleSubmit(
                  handleSubmitCreateFolderForm
                )()
                set_show_create_form_modal(false)
              } else if (
                watchCreateFormFormType === FormTypes.UPLOAD_FILES_TO_FOLDER
              ) {
                await attachmentManager.uploadAllUnstarted()
              }
            }}
          >
            {watchCreateFormFormType === FormTypes.CREATE_FOLDER && '新增'}
            {watchCreateFormFormType === FormTypes.UPLOAD_FILES_TO_FOLDER &&
              '完成'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  )
}

export default ExamineReport
