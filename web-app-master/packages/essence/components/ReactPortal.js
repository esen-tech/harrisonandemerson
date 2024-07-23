import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * https://blog.logrocket.com/build-modal-with-react-portals/
 */

function createWrapperAndAppendToBody(wrapperId) {
  const wrapperElement = document.createElement('div')
  wrapperElement.setAttribute('id', wrapperId)
  document.body.appendChild(wrapperElement)
  return wrapperElement
}

const ReactPortal = ({ children, wrapperId = 'portal-root' }) => {
  const [wrapperElement, setWrapperElement] = useState(null)

  // https://stackoverflow.com/questions/58070996/how-to-fix-the-warning-uselayouteffect-does-nothing-on-the-server
  // useLayoutEffect(() => {
  useEffect(() => {
    let element = document.getElementById(wrapperId)
    let systemCreated = false

    // if element is not found with wrapperId or wrapperId is not provided,
    // create and append to body
    if (!element) {
      systemCreated = true
      element = createWrapperAndAppendToBody(wrapperId)
    }
    setWrapperElement(element)

    return () => {
      // delete the programatically created element
      if (systemCreated && element.parentNode) {
        element.parentNode.removeChild(element)
      }
    }
  }, [wrapperId])

  // wrapperElement state will be null on the very first render.
  if (wrapperElement === null) {
    return null
  }

  return createPortal(children, wrapperElement)
}

export default ReactPortal
