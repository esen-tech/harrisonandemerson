import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Offcanvas from '@esen/essence/components/Offcanvas'
import Spacer from '@esen/essence/components/Spacer'
import Text from '@esen/essence/components/Text'

const CancelAppointmentOffcanvas = ({
  show,
  onHide,
  onCancelAppointmentButtonClick,
}) => {
  return (
    <Offcanvas backdrop show={show} onHide={onHide} placement="bottom">
      <Container>
        <Inline justifyContent="space-between">
          <Heading size="s">確定要取消預約？</Heading>
          <Label pointer>
            <Icon name="close" onClick={onHide} />
          </Label>
        </Inline>
        <Spacer ySize="m" />
        <Text size="s" variant="secondary">
          取消後將把原時段釋出，如果需要預約同一時段，則須前往預約頁面來重新設定。
        </Text>
        <Spacer ySize="l" />
        <Button
          fluid
          inversed
          variant="primary"
          onClick={onCancelAppointmentButtonClick}
        >
          是的，取消預約
        </Button>
      </Container>
    </Offcanvas>
  )
}

export default CancelAppointmentOffcanvas
