import Button from '@esen/essence/components/Button'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Stack from '@esen/essence/components/Stack'
import { useCurrentOrganization } from '@esen/utils/hooks/useCurrentOrganization'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import OrganizationProfilePageLayout from '../../../../components/layout/OrganizationProfilePageLayout'
import Page from '../../../../components/Page'
import { harrisonApiAgent } from '../../../../utils/apiAgent'

const ProfileCreatePage = () => {
  const { organization } = useCurrentOrganization()
  const createEndUserForm = useForm()
  const router = useRouter()

  const handleSubmitCreateEndUserForm = async (payload) => {
    await harrisonApiAgent.post(
      `/iam/organizations/${organization.reference}/end_users`,
      {
        ...payload,
      },
      {
        onFail: (_status, data) => {
          alert(data.message)
        },
        onSuccess: () => {
          router.push(`/organizations/${organization.reference}/profiles`)
        },
      }
    )
  }

  return (
    <OrganizationProfilePageLayout>
      <Page>
        <Page.Header title="建立客戶檔案" />
        <Page.Section>
          <Form
            fluid
            onSubmit={createEndUserForm.handleSubmit(
              handleSubmitCreateEndUserForm
            )}
          >
            <Stack gap="xl">
              <Field as={Stack} gap="s">
                <Label variant="tertiary">姓氏</Label>
                <Input
                  fluid
                  placeholder="王"
                  {...createEndUserForm.register('last_name')}
                />
              </Field>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">名字</Label>
                <Input
                  fluid
                  placeholder="小明"
                  {...createEndUserForm.register('first_name')}
                />
              </Field>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">電話號碼</Label>
                <Input
                  fluid
                  placeholder="+886912345678"
                  {...createEndUserForm.register('phone_number')}
                />
              </Field>
              <Button
                onClick={createEndUserForm.handleSubmit(
                  handleSubmitCreateEndUserForm
                )}
                loading={createEndUserForm.formState.isSubmitting}
              >
                建立
              </Button>
            </Stack>
          </Form>
        </Page.Section>
      </Page>
    </OrganizationProfilePageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ProfileCreatePage
