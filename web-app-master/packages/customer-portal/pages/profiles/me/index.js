import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Field from '@esen/essence/components/Field'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Stack from '@esen/essence/components/Stack'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { genderMap } from '@esen/utils/constants/user'
import { get_full_name } from '@esen/utils/fn'
import { useEndUser } from '@esen/utils/hooks/useEndUser'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import PageNavbar from '../../../components/navigation/PageNavbar'

const StyledIcon = styled(Icon)`
  cursor: pointer;
`

const ProfileMePage = () => {
  const router = useRouter()
  const { endUser } = useEndUser()

  return (
    <AuthPageLayout
      navbar={<PageNavbar onBack={() => router.back()} title="會員檔案" />}
    >
      <Stack gap="s">
        <Container fluid size={false}>
          <Container squished size="l">
            <Inline justifyContent="space-between" alignItems="center">
              <Heading size="s">基本資訊</Heading>
              <Link replace href="/profiles/me/edit-basic">
                <StyledIcon name="edit" />
              </Link>
            </Inline>
          </Container>
          <WithSeparator separator={<Divider indention="all" />}>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">姓名</Label>
                <Input readOnly fluid value={get_full_name(endUser) || 'N/A'} />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">出生日期</Label>
                <Input readOnly fluid value={endUser?.birth_date || 'N/A'} />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">性別</Label>
                <Input
                  readOnly
                  fluid
                  value={genderMap[endUser?.gender] || 'N/A'}
                />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">身分證字號</Label>
                <Input
                  readOnly
                  fluid
                  value={endUser?.tw_identity_card_number || 'N/A'}
                />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">通訊地址</Label>
                <Input
                  readOnly
                  fluid
                  value={endUser?.correspondence_address || 'N/A'}
                />
              </Field>
            </Container>
          </WithSeparator>
        </Container>

        <Container fluid size={false}>
          <Container squished size="l">
            <Inline justifyContent="space-between" alignItems="center">
              <Heading size="s">聯絡資訊</Heading>
              <Link replace href="/profiles/me/edit-contact">
                <StyledIcon name="edit" />
              </Link>
            </Inline>
          </Container>
          <WithSeparator separator={<Divider indention="all" />}>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">聯絡電話</Label>
                <Input readOnly fluid value={endUser?.phone_number || 'N/A'} />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">電子信箱</Label>
                <Input readOnly fluid value={endUser?.email_address || 'N/A'} />
              </Field>
            </Container>
          </WithSeparator>
        </Container>

        <Container fluid size={false}>
          <Container squished size="l">
            <Inline justifyContent="space-between" alignItems="center">
              <Heading size="s">緊急聯絡人</Heading>
              <Link replace href="/profiles/me/edit-emergency-contact">
                <StyledIcon name="edit" />
              </Link>
            </Inline>
          </Container>
          <WithSeparator separator={<Divider indention="all" />}>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">姓名</Label>
                <Input
                  readOnly
                  fluid
                  value={
                    get_full_name(endUser, {
                      firstNameKey: 'emergency_contact_first_name',
                      lastNameKey: 'emergency_contact_last_name',
                    }) || 'N/A'
                  }
                />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">關係</Label>
                <Input
                  readOnly
                  fluid
                  value={endUser?.emergency_contact_relationship_type || 'N/A'}
                />
              </Field>
            </Container>
            <Container>
              <Field as={Stack} gap="s">
                <Label variant="tertiary">聯絡電話</Label>
                <Input
                  readOnly
                  fluid
                  value={endUser?.emergency_contact_phone_number || 'N/A'}
                />
              </Field>
            </Container>
          </WithSeparator>
        </Container>

        <Container fluid>
          <Link replace href="/logout">
            <Button fluid variant="negative" size="s">
              登出
            </Button>
          </Link>
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

export default ProfileMePage
