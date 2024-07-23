import Icon from '@esen/components/Icon'
import Justify from '@esen/components/layout/Justify'
import Button from 'react-bootstrap/Button'
import BSForm from 'react-bootstrap/Form'
import ListGroup from 'react-bootstrap/ListGroup'
import Spinner from 'react-bootstrap/Spinner'

const AttachmentUpload = ({ attachmentManager }) => {
  return (
    <>
      {attachmentManager.managedAttachments.length > 0 && (
        <ListGroup className="mb-3">
          {attachmentManager.managedAttachments.map((at, i) => (
            <ListGroup.Item key={at.file.name}>
              <Justify>
                <span>{at.file.name}</span>
                <span>
                  {at.isInProgress && <Spinner animation="border" />}
                  {at.isSuccess && (
                    <span style={{ color: '#198754' }}>
                      <Icon name="check" /> 上傳成功
                    </span>
                  )}
                  {at.isFailed && (
                    <span style={{ color: '#DC3545' }}>上傳失敗</span>
                  )}
                  {!at.isInProgress && !at.isSuccess && !at.isFailed && (
                    <Button
                      variant="light"
                      onClick={() => attachmentManager.removeAttachment(i)}
                    >
                      <Icon name="remove" />
                    </Button>
                  )}
                </span>
              </Justify>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <BSForm.Control
        type="file"
        disabled={attachmentManager.managedAttachments.length > 0}
        multiple
        onChange={async (e) => {
          attachmentManager.pushFiles(e.target.files)
        }}
      />
    </>
  )
}

export default AttachmentUpload
