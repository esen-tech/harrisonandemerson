import Center from '@esen/components/layout/Center'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import Button from 'react-bootstrap/Button'
import Image from 'react-bootstrap/Image'
import AuthLayout from '../../components/layout/AuthLayout'

const OnboardingDonePage = () => {
  return (
    <AuthLayout container={false}>
      <Center>
        <div className="text-center">
          <Image alt="" src="/logo.png" width="72" height="72" />
          <p className="my-3">感謝您的填寫！</p>
          <Link href="/">
            <Button variant="dark" className="my-3">
              返回首頁
            </Button>
          </Link>
        </div>
      </Center>
    </AuthLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OnboardingDonePage
