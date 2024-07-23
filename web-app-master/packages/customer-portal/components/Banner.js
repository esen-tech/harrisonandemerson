import Image from '@esen/essence/components/Image'
import styled from 'styled-components'

const StyledBanner = styled.div`
  padding: var(--es-theme-space-padding-xl) var(--es-theme-space-padding-m)
    var(--es-theme-space-padding-m) var(--es-theme-space-padding-m);
`

const Banner = ({ src, ...rest }) => {
  return (
    <StyledBanner>
      <Image src={src} {...rest} />
    </StyledBanner>
  )
}

export default Banner
