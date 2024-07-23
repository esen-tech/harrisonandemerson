import { Children, cloneElement } from 'react'

const getSeparator = (separator, identifier) => {
  if (typeof separator === 'string') {
    return separator
  } else {
    return cloneElement(separator, { key: `separator_${identifier}` })
  }
}

const WithSeparator = ({
  separator,
  leading = false,
  trailing = false,
  children,
}) => {
  if (!separator) {
    return children
  }
  const childrenArray = Children.toArray(children)
  let separatedChildren = []
  if (leading) {
    separatedChildren.push(getSeparator(separator, 'leading'))
  }
  for (let i = 0; i < childrenArray.length - 1; i++) {
    const child = childrenArray[i]
    separatedChildren.push(child)
    separatedChildren.push(getSeparator(separator, i))
  }
  separatedChildren.push(childrenArray[childrenArray.length - 1])
  if (trailing) {
    separatedChildren.push(getSeparator(separator, 'trailing'))
  }
  return separatedChildren
}

export default WithSeparator
