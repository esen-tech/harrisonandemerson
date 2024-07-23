import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { emersonApiAgent } from '../utils/apiAgent'

const LogoutPage = () => {
  const router = useRouter()
  const { setEndUser } = useEndUser()

  useEffect(() => {
    async function logout() {
      await emersonApiAgent.post('/iam/end_users/logout', null, {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: (_data) => {
          router.replace('/login')
        },
      })
    }
    setEndUser(null)
    logout()
  }, [])

  return null
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default LogoutPage
