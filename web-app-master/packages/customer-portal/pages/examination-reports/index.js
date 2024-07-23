import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import ListItem from '@esen/essence/components/ListItem'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import { usePaginator } from '@esen/utils/hooks'
import { useInfiniteScroll } from '@esen/utils/hooks/useInfiniteScroll'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import AuthPageLayout from '../../components/layout/AuthPageLayout'
import Navbar from '../../components/navigation/Navbar'
import { emersonApiAgent } from '../../utils/apiAgent'

const ExaminationReportIndexPage = () => {
  const paginator = usePaginator()
  const [examination_reports, set_examination_reports] = useState([])
  const { targetRef } = useInfiniteScroll(() => {
    const isNextDisabled = paginator.isNextDisabled(
      (defaultIsNextDisabled, _previousPages) => {
        const isLastPage =
          examination_reports.length === paginator.activePage?.count_all_page
        return defaultIsNextDisabled || isLastPage
      }
    )
    if (!isNextDisabled) {
      paginator.goNext()
    }
  })

  useEffect(() => {
    async function fetch_examination_reports() {
      await emersonApiAgent.get('/emr/end_users/me/examination_reports', {
        params: {
          page_token: paginator.activePageToken,
        },
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: ({ enhanced_data, metadata: { page } }) => {
          set_examination_reports([...examination_reports, ...enhanced_data])
          paginator.setActivePage(page)
        },
      })
    }
    fetch_examination_reports()
  }, [paginator.activePageToken])

  return (
    <AuthPageLayout navbar={<Navbar />}>
      <Stack grow={1} gap="s">
        <Container fluid>
          <Spacer ySize="l" />
          <Heading>檢驗報告</Heading>
        </Container>

        <Container fluid size={false} style={{ flexGrow: 1 }}>
          {examination_reports.length === 0 ? (
            <Container>
              <Text>沒有檢驗報告。</Text>
            </Container>
          ) : (
            <Stack>
              {examination_reports.map((er) => (
                <Link
                  key={er.reference}
                  href={`/examination-reports/${er.reference}`}
                >
                  <ListItem verticallyCentered controlScope="all">
                    <ListItem.Media>
                      <Icon name="folder_open" fill={false} sizeInPixel={24} />
                    </ListItem.Media>
                    <ListItem.Content title={er.file_group.display_name} />
                    <ListItem.Control icon />
                  </ListItem>
                </Link>
              ))}
              <div ref={targetRef} />
            </Stack>
          )}
        </Container>
      </Stack>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ExaminationReportIndexPage
