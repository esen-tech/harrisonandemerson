import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Image from '@esen/essence/components/Image'
import ListItem from '@esen/essence/components/ListItem'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { get_full_name, get_organization_name } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import AuthPageLayout from '../../../components/layout/AuthPageLayout'
import ModalNavbar from '../../../components/navigation/ModalNavbar'
import { emersonApiAgent } from '../../../utils/apiAgent'

const StyledContainer = styled(Container)`
  position: sticky;
  bottom: 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.05);
`

const OrganizationRetrievePage = () => {
  const router = useRouter()
  const { organization_uuid } = router.query
  const [organization, set_organization] = useState()
  const [service_products, set_service_products] = useState([])
  const [internal_users, set_internal_users] = useState([])

  useEffect(() => {
    async function fetch_service_products() {
      await emersonApiAgent.get(
        `/product/organizations/${organization_uuid}/service_products/unexpired`,
        {
          onSuccess: (data) => {
            set_service_products(data)
          },
        }
      )
    }
    async function fetch_organization() {
      await emersonApiAgent.get(`/iam/organizations/${organization_uuid}`, {
        onSuccess: (data) => {
          set_organization(data)
        },
      })
    }
    if (organization_uuid) {
      fetch_organization()
      fetch_service_products()
    }
  }, [organization_uuid])

  useEffect(() => {
    async function fetch_internal_users(internal_user_reference_set) {
      await emersonApiAgent.get('/iam/internal_users', {
        params: {
          references: Array.from(internal_user_reference_set),
        },
        onSuccess: (data) => {
          set_internal_users(data)
        },
      })
    }
    if (service_products.length > 0) {
      const internal_user_reference_set = service_products.reduce((s, sp) => {
        sp.service_product_internal_users.forEach((spiu) =>
          s.add(spiu.internal_user_reference)
        )
        return s
      }, new Set())
      fetch_internal_users(internal_user_reference_set)
    }
  }, [service_products])

  return (
    <AuthPageLayout
      navbar={
        <ModalNavbar title="診所資訊" onDismiss={() => router.replace('/')} />
      }
    >
      <Stack grow={1} justifyContent="space-between">
        <Stack gap="s">
          <Container fluid size={false}>
            <Image fluid src={organization?.banner_src} />
            <Container>
              <Stack gap="s">
                <Heading>{get_organization_name(organization)}</Heading>
                <Text size="s" variant="tertiary">
                  {organization?.correspondence_address}
                </Text>
                <Text size="xs" variant="tertiary">
                  {organization?.phone_number}
                </Text>
              </Stack>
            </Container>
          </Container>

          <Container fluid size={false}>
            <Container squished size="l">
              <Heading size="s">服務項目</Heading>
            </Container>
            <WithSeparator separator={<Divider indention="all" />}>
              {service_products.map((sp) => (
                <Link
                  key={sp.reference}
                  replace
                  href={{
                    pathname: `/organizations/${organization_uuid}/services/${sp.reference}`,
                    query: {
                      referrer: `/organizations/${organization_uuid}`,
                    },
                  }}
                >
                  <ListItem
                    verticallyCentered
                    controlScope="all"
                    description={sp.display_description_key}
                  >
                    <ListItem.Content
                      title={sp.display_sku_key}
                      metadata={[
                        <>
                          <Icon name="schedule" fill={false} />
                          {sp.duration_in_time_slots * 5} mins
                        </>,
                      ]}
                    />
                    <ListItem.Control icon />
                  </ListItem>
                </Link>
              ))}
            </WithSeparator>
          </Container>

          <Container fluid size={false}>
            <Container squished size="l">
              <Heading size="s">服務醫師</Heading>
            </Container>
            <WithSeparator separator={<Divider indention="all" />}>
              {internal_users.map((iu) => (
                <ListItem key={iu.reference} description={iu.biography}>
                  <ListItem.Media image={{ src: iu.avatar_src }} />
                  <ListItem.Content
                    title={get_full_name(iu)}
                    paragraph={iu.education}
                  />
                </ListItem>
              ))}
            </WithSeparator>
          </Container>
        </Stack>

        <StyledContainer fluid>
          <Link
            replace
            href={{
              pathname: '/appointments/create',
              query: {
                referrer: router.query.referrer,
              },
            }}
          >
            <Button fluid inversed variant="primary" size="s">
              預約時段
            </Button>
          </Link>
        </StyledContainer>
      </Stack>
    </AuthPageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OrganizationRetrievePage
