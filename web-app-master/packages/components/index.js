import React from 'react'

// https://github.com/vercel/next.js/issues/7322#issuecomment-987086391
export const ClientOnly = ({ children, ...delegated }) => {

  const [hasMounted, setHasMounted] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasMounted(true)
    }
  }, [])

  if (!hasMounted) return null

  return (
    <React.Fragment {...delegated}>
      {children}
    </React.Fragment>
  )
}
