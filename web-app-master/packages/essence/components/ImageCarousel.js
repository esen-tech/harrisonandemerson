import { forwardRef, useState } from 'react'
import styled from 'styled-components'
import Badge from './Badge'
import Container from './Container'
import Icon from './Icon'
import Image from './Image'

const StyledImageCarousel = styled(Container)`
  position: relative;
`

const StyledPreviousIcon = styled(Icon)`
  position: absolute;
  top: 50%;
  left: var(--es-theme-space-padding-m);
  height: 100%;
`

const StyledNextIcon = styled(Icon)`
  position: absolute;
  top: 50%;
  right: var(--es-theme-space-padding-m);
  height: 100%;
`

const StyledBadge = styled(Badge)`
  position: absolute;
  left: var(--es-theme-space-padding-m);
  bottom: var(--es-theme-space-padding-m);
`

const ImageCarousel = forwardRef(({ srcs, ...rest }, ref) => {
  const [activeIndex, setActiveIndex] = useState(0)
  return (
    <StyledImageCarousel ref={ref} size={false} {...rest}>
      <Image fluid src={srcs?.[activeIndex]} />
      <StyledBadge>
        {activeIndex + 1}/{srcs?.length}
      </StyledBadge>
      {activeIndex > 0 && (
        <StyledPreviousIcon
          name="chevron_left"
          sizeInPixel={24}
          pointer
          onClick={() => setActiveIndex((i) => i - 1)}
        />
      )}
      {activeIndex < srcs?.length - 1 && (
        <StyledNextIcon
          name="chevron_right"
          sizeInPixel={24}
          pointer
          onClick={() => setActiveIndex((i) => i + 1)}
        />
      )}
    </StyledImageCarousel>
  )
})

export default ImageCarousel
