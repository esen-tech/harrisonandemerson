import Anchor from '@esen/components/Anchor'
import DropdownToggle from '@esen/components/dropdown/DropdownToggle'
import Embed from '@esen/components/Embed'
import Icon from '@esen/components/Icon'
import Justify from '@esen/components/layout/Justify'
import Breadcrumb from '@esen/components/navigation/Breadcrum'
import { get_local_datetime } from '@esen/utils/fn'
import { getReadableSize } from '@esen/utils/functions/attachment'
import { usePaginator } from '@esen/utils/hooks'
import { useAttachmentManager } from '@esen/utils/hooks/attachment'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Dropdown from 'react-bootstrap/Dropdown'
import BSForm from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import styled from 'styled-components'
import { harrisonApiAgent } from '../../utils/apiAgent'
import AttachmentIcon from './AttachmentIcon'
import AttachmentUpload from './AttachmentUpload'

const StyledTr = styled.tr`
  cursor: pointer;
`

const ActiveExamineReport = ({ examineReport, onClearExamineReportId }) => {
  const router = useRouter()
  const paginator = usePaginator()
  const { organization } = useCurrentOrganization()
  const [files, set_files] = useState([])
  const [active_file_reference, set_active_file_reference] = useState()
  const [active_file, set_active_file] = useState()
  const [
    show_upload_attachments_form_modal,
    set_show_upload_attachments_form_modal,
  ] = useState(false)
  const attachmentManager = useAttachmentManager(
    async (attachment, onSuccess, onFail) => {
      if (examineReport === undefined) {
        return
      }
      const formData = new FormData()
      formData.append('upload_file', attachment.file)
      await harrisonApiAgent.post(
        `/emr/organizations/${organization.reference}/end_users/${examineReport.end_user_reference}/examination_reports/${examineReport.reference}/files`,
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

  useEffect(() => {
    async function fetch_attachment_group_attachments() {
      await harrisonApiAgent.get(
        `/emr/organizations/${organization.reference}/end_users/${examineReport.end_user_reference}/examination_reports/${examineReport.reference}/files`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_files(enhanced_data)
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (organization && examineReport) {
      fetch_attachment_group_attachments()
    }
  }, [organization, examineReport, paginator.activePageToken])

  useEffect(() => {
    async function fetch_file_group_file() {
      await harrisonApiAgent.get(
        `/emr/organizations/${organization.reference}/end_users/${examineReport.end_user_reference}/examination_reports/${examineReport.reference}/files/${active_file_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_active_file(enhanced_data)
          },
        }
      )
    }
    if (organization && active_file_reference) {
      fetch_file_group_file()
    }
  }, [organization, active_file_reference])

  const handleDeleteFile = async (file) => {
    await harrisonApiAgent.delete(
      `/emr/organizations/${organization.reference}/end_users/${examineReport.end_user_reference}/examination_reports/${examineReport.reference}/files/${file.reference}`,
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: (data) => {
          router.reload()
        },
      }
    )
  }

  const handleCloseUploadAttachmentsFormModal = () => {
    set_show_upload_attachments_form_modal(false)
    router.reload()
    // set_files((attachments) => [
    //   ...attachmentManager.managedAttachments
    //     .filter((ma) => ma.isSuccess)
    //     .map((ma) => ma.resData),
    //   ...attachments,
    // ])
    // attachmentManager.reset()
  }

  return (
    <>
      <Justify className="mb-3">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Anchor onClick={onClearExamineReportId}>檔案列表</Anchor>
          </Breadcrumb.Item>
          {examineReport && (
            <Breadcrumb.Item className="d-flex align-items-center">
              <Icon name="folder" className="me-2" />
              {examineReport.file_group.display_name}
            </Breadcrumb.Item>
          )}
        </Breadcrumb>
        <Button
          variant="dark"
          onClick={() => set_show_upload_attachments_form_modal(true)}
        >
          <Icon name="add" />
          上傳檔案
        </Button>
      </Justify>

      <Table bordered hover>
        <thead>
          <tr>
            <th>檔案名稱</th>
            <th>建立日期</th>
            <th>檔案大小</th>
          </tr>
        </thead>
        <tbody>
          {files.length === 0 ? (
            <tr>
              <td colSpan={3}>沒有檔案。</td>
            </tr>
          ) : (
            files.map((file) => (
              <StyledTr
                key={file.reference}
                onClick={() => set_active_file_reference(file.reference)}
              >
                <td
                  style={{
                    wordBreak: 'break-all',
                  }}
                >
                  <AttachmentIcon contentType={file.content_type} />{' '}
                  {file.display_name}
                </td>
                <td
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  {get_local_datetime(file.create_time, 'yyyy-MM-dd')}
                </td>
                <td
                  style={{
                    whiteSpace: 'nowrap',
                  }}
                >
                  <Justify>
                    <span>{getReadableSize(file.size_in_byte)}</span>
                    <Dropdown
                      align="end"
                      variant="light"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownToggle>
                        <Icon name="more_vert" />
                      </DropdownToggle>
                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleDeleteFile(file)}>
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
            <td colSpan={3}>
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
                            files.length ===
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

      <Modal
        show={show_upload_attachments_form_modal}
        onHide={handleCloseUploadAttachmentsFormModal}
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
                <BSForm.Label>資料夾</BSForm.Label>
                <BSForm.Control
                  type="text"
                  readOnly
                  value={examineReport.file_group.display_name}
                />
              </BSForm.Group>
            </Row>
            <Row className="mb-3">
              <BSForm.Group as={Col}>
                <BSForm.Label>上傳檔案</BSForm.Label>
                <AttachmentUpload attachmentManager={attachmentManager} />
              </BSForm.Group>
            </Row>
          </BSForm>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="light"
            onClick={handleCloseUploadAttachmentsFormModal}
          >
            關閉
          </Button>
          <Button
            variant="dark"
            onClick={async () => {
              await attachmentManager.uploadAllUnstarted()
            }}
          >
            新增
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={active_file_reference !== undefined}
        onHide={() => {
          set_active_file_reference(undefined)
          set_active_file(undefined)
        }}
        scrollable={false}
        animation={false}
        fullscreen
      >
        <Modal.Header closeButton>
          <Modal.Title
            className="d-flex align-items-center"
            style={{
              wordBreak: 'break-all',
            }}
          >
            <AttachmentIcon contentType={active_file?.content_type} />
            <span className="mx-1">{active_file?.display_name}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Embed attachment={active_file} />
        </Modal.Body>
      </Modal>
    </>
  )
}

export default ActiveExamineReport
