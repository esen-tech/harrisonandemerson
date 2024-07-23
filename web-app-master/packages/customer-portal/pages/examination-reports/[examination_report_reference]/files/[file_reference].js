import Embed from '@esen/components/Embed'
import Container from '@esen/essence/components/Container'
import Stack from '@esen/essence/components/Stack'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AuthPageLayout from '../../../../components/layout/AuthPageLayout'
import PageNavbar from '../../../../components/navigation/PageNavbar'
import apiAgent from '../../../../utils/apiAgent'

const FileRetrievePage = () => {
  const router = useRouter()
  const [file, set_file] = useState()

  const { examination_report_reference, file_reference } = router.query

  useEffect(() => {
    async function fetch_attachment() {
      await apiAgent.get(
        `/emr/end_users/me/examination_reports/${examination_report_reference}/files/${file_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_file(enhanced_data)
          },
        }
      )
    }
    if (examination_report_reference && file_reference) {
      fetch_attachment()
    }
  }, [examination_report_reference, file_reference])

  return (
    <AuthPageLayout
      navbar={
        <PageNavbar
          onBack={() =>
            router.push(`/examination-reports/${examination_report_reference}`)
          }
          title={file?.display_name}
        />
      }
    >
      <Container as={Stack} fluid grow={1}>
        <Embed attachment={file} />
      </Container>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default FileRetrievePage
