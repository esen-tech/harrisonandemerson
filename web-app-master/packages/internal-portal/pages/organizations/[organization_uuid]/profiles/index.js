import Button from '@esen/essence/components/Button'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import Table from '@esen/essence/components/Table'
import { FilterTypes } from '@esen/utils/constants/end_user'
import { get_full_name } from '@esen/utils/fn'
import { usePaginator } from '@esen/utils/hooks'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Dropdown from 'react-bootstrap/Dropdown'
import DropdownButton from 'react-bootstrap/DropdownButton'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import { useForm } from 'react-hook-form'
import OrganizationProfilePageLayout from '../../../../components/layout/OrganizationProfilePageLayout'
import Page from '../../../../components/Page'
import { IDENTIFIER_KEY } from '../../../../constants/permission'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const ProfileIndexPage = () => {
  const { organization } = useCurrentOrganization()
  const [filterType, setFilterType] = useState(FilterTypes.NAME)
  const [filterQuery, setFilterQuery] = useState()
  const filterForm = useForm()
  const paginator = usePaginator()
  const [end_users, set_end_users] = useState([])
  const { identifierKeys } = useInternalUser()
  const router = useRouter()

  const fetchProfiles = async (filter) => {
    await harrisonApiAgent.get(
      `/iam/organizations/${organization.reference}/end_users`,
      {
        params: {
          page_token: paginator.activePageToken,
          filter,
        },
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: ({ enhanced_data, metadata: { page } }) => {
          set_end_users(enhanced_data)
          paginator.setActivePage(page)
        },
      }
    )
  }

  useEffect(() => {
    if (organization) {
      fetchProfiles({
        type: filterType.type,
        query: filterQuery,
      })
    }
  }, [organization, paginator.activePageToken])

  const handleSubmitFilterForm = (payload) => {
    paginator.reset()
    setFilterQuery(payload.query)
    fetchProfiles({
      type: filterType.type,
      query: payload.query,
    })
  }

  return (
    <OrganizationProfilePageLayout>
      <Page>
        <Page.Header
          title="病歷資料"
          rightControl={
            <Form onSubmit={filterForm.handleSubmit(handleSubmitFilterForm)}>
              <InputGroup>
                <DropdownButton
                  variant="outline-secondary"
                  title={filterType.dropdownLabel}
                  size="sm"
                >
                  {Object.values(FilterTypes).map((ft) => (
                    <Dropdown.Item
                      key={ft.dropdownLabel}
                      onClick={() => setFilterType(ft)}
                    >
                      {ft.dropdownLabel}
                    </Dropdown.Item>
                  ))}
                </DropdownButton>
                <Form.Control size="sm" {...filterForm.register('query')} />
                <Button variant="outline-secondary" size="sm" type="submit">
                  <Icon name="search" />
                </Button>
              </InputGroup>
            </Form>
          }
        />

        <Page.Section size={false}>
          <Table fluid>
            <thead>
              <tr>
                <Table.Th leftIndent>姓名</Table.Th>
                <Table.Th>出生日期</Table.Th>
                <Table.Th>身分證字號</Table.Th>
                <Table.Th rightIndent>聯絡電話</Table.Th>
              </tr>
            </thead>
            <tbody>
              {end_users.map((eu) => (
                <Link
                  key={eu.reference}
                  href={`/organizations/${organization?.reference}/profiles/${eu.reference}`}
                >
                  <Table.Tr pointer>
                    <Table.Td leftIndent>{get_full_name(eu)}</Table.Td>
                    <Table.Td>{eu.birth_date}</Table.Td>
                    <Table.Td>{eu.tw_identity_card_number}</Table.Td>
                    <Table.Td rightIndent>{eu.phone_number}</Table.Td>
                  </Table.Tr>
                </Link>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <Table.Td crossRow leftIndent>
                  {identifierKeys.includes(IDENTIFIER_KEY.END_USER_EDITOR) && (
                    <Button
                      prefix={<Icon name="add" />}
                      size="s"
                      onClick={() =>
                        router.push(
                          `/organizations/${organization.reference}/profiles/create`
                        )
                      }
                    >
                      新增
                    </Button>
                  )}
                </Table.Td>
              </tr>
            </tfoot>
          </Table>
        </Page.Section>

        <Page.Footer squished>
          <Inline justifyContent="space-between">
            <Inline gap="s" alignItems="center">
              <Label size="s">單頁顯示數量</Label>
              <Label size="s">{paginator.activePage?.count_per_page}</Label>
            </Inline>
            <Inline gap="xl">
              <Inline gap="s" alignItems="center">
                <Label size="s">總共</Label>
                <Label size="s">{paginator.activePage?.count_all_page}</Label>
              </Inline>
              <Inline gap="m" alignItems="center">
                <Icon
                  name="navigate_before"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goPrev}
                  disabled={paginator.isPrevDisabled()}
                />
                <Icon
                  name="navigate_next"
                  sizeInPixel={20}
                  pointer
                  onClick={paginator.goNext}
                  disabled={paginator.isNextDisabled(
                    (defaultIsNextDisabled, previousPages) => {
                      const isLastPage =
                        previousPages.length *
                          (paginator.activePage?.count_per_page || 0) +
                          end_users.length ===
                        paginator.activePage?.count_all_page
                      return defaultIsNextDisabled || isLastPage
                    }
                  )}
                />
              </Inline>
            </Inline>
          </Inline>
        </Page.Footer>
      </Page>
    </OrganizationProfilePageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ProfileIndexPage
