import { forwardRef, useEffect, useState } from 'react'
import styled from 'styled-components'

const StyledImage = styled.img`
  image-rendering: -webkit-optimize-contrast;
  object-fit: cover;
  position: relative;

  ${({ $fluid }) => {
    if ($fluid) {
      return `
        width: 100%;
        height: auto;
      `
    }
  }}

  ${({ $rounded }) => {
    if ($rounded) {
      return `
        border-radius: 50%;
      `
    }
  }}

  ${({ $loaded, $errored }) => {
    // https://dev.to/sasscrafter/how-to-style-broken-images-with-css-4il2
    if ($errored) {
      return `
        &::before {
          content: attr(alt);
          font-size: 0.5rem;
          width: 100%;
          height: 100%;
          background-color: var(--es-theme-bg-negative-default);
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          top: 50%;
          transform: translateY(-50%);
        }
      `
    }

    if (!$loaded) {
      return `
        background-color: var(--es-theme-bg-tertiary-default);
      `
    }
  }}
`

const Image = forwardRef(
  ({ src, fluid = false, rounded = false, alt = 'Failed', ...rest }, ref) => {
    const [loaded, setLoaded] = useState(false)
    const [errored, setErrored] = useState(false)

    useEffect(() => {
      setLoaded(false)
    }, [src])

    const handleImageLoad = () => {
      setLoaded(true)
    }
    const handleError = () => {
      setErrored(true)
    }

    return (
      <StyledImage
        ref={ref}
        loading="lazy"
        $fluid={fluid}
        $rounded={rounded}
        $loaded={loaded}
        $errored={errored}
        onLoad={handleImageLoad}
        onError={handleError}
        alt={alt}
        src={src}
        {...rest}
      />
    )
  }
)

export default Image
