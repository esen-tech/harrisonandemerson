import { useEndUser } from '@esen/utils/hooks/useEndUser'
import PageLayout from './PageLayout'

const AuthPageLayout = (props) => {
  const { endUser } = useEndUser()

  if (!endUser) {
    return null
  }
  return <PageLayout {...props} />
}

export default AuthPageLayout
