import Container from '@esen/essence/components/Container'
import DropdownSelect from '@esen/essence/components/DropdownSelect'
import Field from '@esen/essence/components/Field'
import Form from '@esen/essence/components/Form'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Stack from '@esen/essence/components/Stack'
import { genderMap, GENDER_ENUM } from '@esen/utils/constants/user'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import PageNavbar from '../../../components/navigation/PageNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const ProfileEditBasicPage = () => {
  const router = useRouter()
  const { endUser, fetchEndUser } = useEndUser()
  const editBasicProfileForm = useForm()

  useEffect(() => {
    if (endUser) {
      editBasicProfileForm.setValue('birth_date', endUser.birth_date)
      editBasicProfileForm.setValue('gender', endUser.gender)
      editBasicProfileForm.setValue(
        'correspondence_address',
        endUser.correspondence_address
      )
      editBasicProfileForm.setValue(
        'tw_identity_card_number',
        endUser.tw_identity_card_number
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
          router.replace('/profiles/me')
        },
      }
    )
  }

  return (
    <AuthPageLayout
      navbar={
        <PageNavbar
          onBack={() => router.replace('/profiles/me')}
          title="基本資訊"
          rightAction={
            <PageNavbar.Action
              disabled={
                !editBasicProfileForm.formState.isDirty ||
                editBasicProfileForm.formState.isSubmitting ||
                editBasicProfileForm.formState.isSubmitted
              }
              onClick={editBasicProfileForm.handleSubmit(onSubmit)}
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
          onSubmit={editBasicProfileForm.handleSubmit(onSubmit)}
        >
          <Stack gap="xl">
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">姓氏</Label>
              <Input readOnly fluid value={endUser?.last_name || 'N/A'} />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">名字</Label>
              <Input readOnly fluid value={endUser?.first_name || 'N/A'} />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">出生日期</Label>
              <Input
                fluid
                type="date"
                {...editBasicProfileForm.register('birth_date')}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">性別</Label>
              <Controller
                control={editBasicProfileForm.control}
                name="gender"
                render={({ field }) => (
                  <DropdownSelect
                    fluid
                    options={[
                      GENDER_ENUM.MALE,
                      GENDER_ENUM.FEMALE,
                      GENDER_ENUM.NON_BINARY,
                    ].map((ge) => ({
                      value: ge,
                      label: genderMap[ge],
                    }))}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">身分證字號</Label>
              <Input
                fluid
                {...editBasicProfileForm.register('tw_identity_card_number')}
              />
            </Field>
            <Field as={Stack} gap="s" fluid>
              <Label variant="tertiary">通訊地址</Label>
              <Input
                fluid
                {...editBasicProfileForm.register('correspondence_address')}
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

export default ProfileEditBasicPage
