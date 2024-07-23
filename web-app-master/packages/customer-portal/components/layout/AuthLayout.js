import { useEndUser } from '@esen/utils/hooks/useEndUser'
import Container from 'react-bootstrap/Container'
import TopNavigation from '../navigation/TopNavigation'
import AppLayout from './AppLayout'

const AuthLayout = ({
  container = true,
  backHref,
  title,
  action,
  children,
  hasTopNavigation = true,
}) => {
  const { endUser } = useEndUser()

  if (!endUser) {
    return null
  }
  return (
    <AppLayout>
      {hasTopNavigation && (
        <TopNavigation backHref={backHref} title={title} action={action} />
      )}
      {container ? (
        <Container className="py-3">{children}</Container>
      ) : (
        children
      )}
    </AppLayout>
  )
}

export default AuthLayout
