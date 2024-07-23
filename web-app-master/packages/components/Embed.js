import Container from '@esen/essence/components/Container'
import Image from '@esen/essence/components/Image'
import { ContentTypeEnum } from '@esen/utils/constants/attachment'

const Embed = ({ attachment }) => {
  if (!attachment) {
    return null
  }
  if (attachment.content_type === ContentTypeEnum.APPLICATION_PDF) {
    return (
      <Container fluid fill size={false}>
        <object
          type="application/pdf"
          data={attachment.url}
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <p>
            無法顯示檔案，此份
            <a href={attachment.url} target="_blank">
              檔案連結
            </a>
            可能已過期，請重新整理。
          </p>
        </object>
      </Container>
    )
  } else if (attachment.content_type === ContentTypeEnum.IMAGE_JPEG) {
    return (
      <Container fluid fill size={false}>
        <Image fluid src={attachment.url} />
      </Container>
    )
  } else if (attachment.content_type === ContentTypeEnum.VIDEO_MP4) {
    return (
      <Container fluid fill size={false}>
        <video
          controls
          autoPlay
          style={{
            width: '100%',
            height: '100%',
          }}
        >
          <source src={attachment.url} type={attachment.content_type} />
        </video>
      </Container>
    )
  } else {
    return <p>未支援的檔案格式。</p>
  }
}

export default Embed
