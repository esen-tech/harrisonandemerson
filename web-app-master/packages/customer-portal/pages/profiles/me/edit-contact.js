import Container from '@esen/essence/components/Container'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Stack from '@esen/essence/components/Stack'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import PageNavbar from '../../../components/navigation/PageNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const ProfileEditContactPage = () => {
  const router = useRouter()
  const { endUser, fetchEndUser } = useEndUser()
  const editContactProfileForm = useForm()

  useEffect(() => {
    if (endUser) {
      editContactProfileForm.setValue('email_address', endUser?.email_address)
    }
  }, [endUser])

  const onSubmit = async (values) => {
    await emersonApiAgent.patch(
      '/iam/end_users/me',
      {
        ...values,
      },
      {
        onFail: (status, data) => {
          alert(data.message)
        },
        onSuccess: () => {
          fetchEndUser()
          router.push('/profiles/me')
        },
      }
    )
  }

  return (
    <AuthPageLayout
      navbar={
        <PageNavbar
          onBack={() => router.replace('/profiles/me')}
          title="聯絡資訊"
          rightAction={
            <PageNavbar.Action
              disabled={
                !editContactProfileForm.formState.isDirty ||
                editContactProfileForm.formState.isSubmitting ||
                editContactProfileForm.formState.isSubmitted
              }
              onClick={editContactProfileForm.handleSubmit(onSubmit)}
            >
              儲存
            </PageNavbar.Action>
          }
        />
      }
    >
      <Container fluid>
        <Form
          submitOnEnter
          onSubmit={editContactProfileForm.handleSubmit(onSubmit)}
        >
          <Stack gap="xl">
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">聯絡電話</Label>
              <Input readOnly fluid value={endUser?.phone_number || 'N/A'} />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">電子信箱</Label>
              <Input
                fluid
                {...editContactProfileForm.register('email_address')}
              />
            </Field>
          </Stack>
        </Form>
      </Container>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default ProfileEditContactPage
