import Icon from '@esen/components/Icon'
import { ContentTypeEnum } from '@esen/utils/constants/attachment'

const AttachmentIcon = ({ contentType }) => {
  if (contentType === ContentTypeEnum.APPLICATION_PDF) {
    return <Icon name="picture_as_pdf" />
  } else if (contentType === ContentTypeEnum.IMAGE_JPEG) {
    return <Icon name="image" />
  } else if (contentType === ContentTypeEnum.VIDEO_MP4) {
    return <Icon name="movie" />
  } else {
    return null
  }
}

export default AttachmentIcon
