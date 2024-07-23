import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import ListItem from '@esen/essence/components/ListItem'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { ContentTypeEnum } from '@esen/utils/constants/attachment'
import { get_local_datetime } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useInfiniteScroll } from '@esen/utils/hooks/useInfiniteScroll'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import PageNavbar from '../../../components/navigation/PageNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const ExaminationReportRetrievePage = () => {
  const router = useRouter()
  const paginator = usePaginator()
  const [examination_report, set_examination_report] = useState()
  const [files, set_files] = useState([])
  const { targetRef } = useInfiniteScroll(() => {
    const isNextDisabled = paginator.isNextDisabled(
      (defaultIsNextDisabled, _previousPages) => {
        const isLastPage = files.length === paginator.activePage?.count_all_page
        return defaultIsNextDisabled || isLastPage
      }
    )
    if (!isNextDisabled) {
      paginator.goNext()
    }
  })

  const { examination_report_reference } = router.query

  useEffect(() => {
    async function fetch_examination_report() {
      await emersonApiAgent.get(
        `/emr/end_users/me/examination_reports/${examination_report_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            set_examination_report(enhanced_data)
          },
        }
      )
    }
    if (examination_report_reference) {
      fetch_examination_report()
    }
  }, [examination_report_reference])

  useEffect(() => {
    async function fetch_file_group_files() {
      await emersonApiAgent.get(
        `/emr/end_users/me/examination_reports/${examination_report_reference}/files`,
        {
          params: {
            page_token: paginator.activePageToken,
          },
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data, metadata: { page } }) => {
            set_files([...files, ...enhanced_data])
            paginator.setActivePage(page)
          },
        }
      )
    }
    if (examination_report) {
      fetch_file_group_files()
    }
  }, [examination_report, paginator.activePageToken])

  const handleFileClick = async (file) => {
    if (file.content_type === ContentTypeEnum.APPLICATION_PDF) {
      await emersonApiAgent.get(
        `/emr/end_users/me/examination_reports/${examination_report_reference}/files/${file.reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: ({ enhanced_data }) => {
            router.push(enhanced_data.url)
          },
        }
      )
    } else {
      router.push(
        `/examination-reports/${examination_report_reference}/files/${file.reference}`
      )
    }
  }

  return (
    <AuthPageLayout
      navbar={
        <PageNavbar
          onBack={() => router.push('/examination-reports')}
          title={examination_report?.file_group?.display_name}
        />
      }
    >
      {files.length === 0 ? (
        <Container as={Stack} grow={1}>
          <Text>沒有檔案。</Text>
        </Container>
      ) : (
        <Container as={Stack} grow={1} size={false}>
          <WithSeparator separator={<Divider indention="left" />}>
            {files.map((file) => (
              <ListItem
                key={file.reference}
                controlScope="all"
                onClick={() => handleFileClick(file)}
              >
                <ListItem.Content
                  title={file.display_name}
                  paragraph={get_local_datetime(file.create_time, 'yyyy-MM-dd')}
                  badge={{
                    variant: 'secondary',
                    children:
                      file.content_type === ContentTypeEnum.APPLICATION_PDF
                        ? '下載'
                        : '檢視',
                  }}
                />
              </ListItem>
            ))}
          </WithSeparator>
          <div ref={targetRef} />
        </Container>
      )}
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ExaminationReportRetrievePage
