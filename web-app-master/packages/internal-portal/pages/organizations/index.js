import Center from '@esen/components/layout/Center'
import { get_organization_name } from '@esen/utils/fn'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { useInternalUser } from '@esen/utils/hooks/useInternalUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import Row from 'react-bootstrap/Row'
import { useForm } from 'react-hook-form'
import AppLayout from '../../components/layout/AppLayout'

const OrganizationSelectionPage = () => {
  const selectOrganizationForm = useForm()
  const { internalUser } = useInternalUser()
  const { organizations } = useCurrentOrganization()

  const watchOrganizationUUID = selectOrganizationForm.watch('organizationUUID')

  return (
    <AppLayout>
      <Center>
        <div className="text-center">
          <Image alt="" src="/logo.png" width="72" height="72" />
          <h5>{internalUser?.first_name} 你好</h5>
        </div>
        <br />
        <Form>
          <Row className="mb-1">
            <Form.Group as={Col}>
              <Form.Select
                defaultValue=""
                {...selectOrganizationForm.register('organizationUUID')}
              >
                <option disabled value="">
                  你今天在哪裡看診呢？
                </option>
                {organizations.map((org) => (
                  <option key={org.reference} value={org.reference}>
                    {get_organization_name(org)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>
          <Row>
            <Form.Group as={Col} className="d-grid gap-2">
              <Link passHref href={`/organizations/${watchOrganizationUUID}`}>
                <Button variant="dark" disabled={!watchOrganizationUUID}>
                  選擇診所
                </Button>
              </Link>
            </Form.Group>
          </Row>
        </Form>
      </Center>
    </AppLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OrganizationSelectionPage
