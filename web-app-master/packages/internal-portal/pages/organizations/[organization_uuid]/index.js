import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Container from 'react-bootstrap/Container'
import OrganizationDashboardPageLayout from '../../../components/layout/OrganizationDashboardPageLayout'

const OrganizationDashboardPage = () => {
  return (
    <OrganizationDashboardPageLayout>
      <Container fluid className="pt-5 pb-3">
        目前沒有儀表板。
      </Container>
    </OrganizationDashboardPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OrganizationDashboardPage
