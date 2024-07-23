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

const ProfileEditEmergencyContactPage = () => {
  const router = useRouter()
  const { endUser, fetchEndUser } = useEndUser()
  const editEmergencyContactProfileForm = useForm()

  useEffect(() => {
    if (endUser) {
      editEmergencyContactProfileForm.setValue(
        'emergency_contact_first_name',
        endUser.emergency_contact_first_name
      )
      editEmergencyContactProfileForm.setValue(
        'emergency_contact_last_name',
        endUser.emergency_contact_last_name
      )
      editEmergencyContactProfileForm.setValue(
        'emergency_contact_relationship_type',
        endUser.emergency_contact_relationship_type
      )
      editEmergencyContactProfileForm.setValue(
        'emergency_contact_phone_number',
        endUser.emergency_contact_phone_number
      )
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
          title="緊急聯絡人"
          rightAction={
            <PageNavbar.Action
              disabled={
                !editEmergencyContactProfileForm.formState.isDirty ||
                editEmergencyContactProfileForm.formState.isSubmitting ||
                editEmergencyContactProfileForm.formState.isSubmitted
              }
              onClick={editEmergencyContactProfileForm.handleSubmit(onSubmit)}
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
          onSubmit={editEmergencyContactProfileForm.handleSubmit(onSubmit)}
        >
          <Stack gap="xl">
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">姓氏</Label>
              <Input
                fluid
                {...editEmergencyContactProfileForm.register(
                  'emergency_contact_last_name'
                )}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">名字</Label>
              <Input
                fluid
                {...editEmergencyContactProfileForm.register(
                  'emergency_contact_first_name'
                )}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">關係</Label>
              <Input
                fluid
                {...editEmergencyContactProfileForm.register(
                  'emergency_contact_relationship_type'
                )}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">聯絡電話</Label>
              <Input
                fluid
                {...editEmergencyContactProfileForm.register(
                  'emergency_contact_phone_number'
                )}
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

export default ProfileEditEmergencyContactPage
