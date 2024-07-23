import Badge from '@esen/essence/components/Badge'
import Button from '@esen/essence/components/Button'
import Container from '@esen/essence/components/Container'
import Divider from '@esen/essence/components/Divider'
import Heading from '@esen/essence/components/Heading'
import Icon from '@esen/essence/components/Icon'
import Inline from '@esen/essence/components/Inline'
import Label from '@esen/essence/components/Label'
import ListItem from '@esen/essence/components/ListItem'
import Stack from '@esen/essence/components/Stack'
import Text from '@esen/essence/components/Text'
import WithSeparator from '@esen/essence/components/WithSeparator'
import { get_full_name } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import AuthPageLayout from '../../../../components/layout/AuthPageLayout'
import ModalNavbar from '../../../../components/navigation/ModalNavbar'
import { emersonApiAgent } from '../../../../utils/apiAgent'

const StyledContainer = styled(Container)`
  position: sticky;
  bottom: 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.05);
`

const OrganizationServiceRetrievePage = () => {
  const router = useRouter()
  const { service_uuid } = router.query
  const [service_product, set_service_product] = useState()
  const [internal_users, set_internal_users] = useState([])

  useEffect(() => {
    async function fetch_service_product() {
      await emersonApiAgent.get(`/product/service_products/${service_uuid}`, {
        onSuccess: (data) => {
          set_service_product(data)
        },
      })
    }
    if (service_uuid) {
      fetch_service_product()
    }
  }, [service_uuid])

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
    if (service_product?.service_product_internal_users?.length > 0) {
      const internal_user_reference_set =
        service_product.service_product_internal_users.reduce((s, spiu) => {
          s.add(spiu.internal_user_reference)
          return s
        }, new Set())
      fetch_internal_users(internal_user_reference_set)
    }
  }, [service_product?.service_product_internal_users])

  return (
    <AuthPageLayout
      navbar={
        <ModalNavbar
          title="服務項目"
          onBack={() => router.replace(router.query.referrer)}
        />
      }
    >
      <Stack fluid grow={1} justifyContent="space-between">
        <Stack fluid gap="s">
          <Container fluid size={false}>
            <Container>
              <Stack gap="m">
                <Heading size="l">{service_product?.display_sku_key}</Heading>
                <Inline gap="s" alignItems="center">
                  <Badge>
                    {service_product?.service_product_insurers?.length > 0
                      ? '健保'
                      : '自費'}
                  </Badge>
                  <Label size="s" variant="tertiary">
                    <Icon name="schedule" fill={false} />
                    門診長度 {service_product?.duration_in_time_slots * 5} mins
                  </Label>
                  <Label size="s" variant="tertiary">
                    <Icon name="attach_money" />
                    費用 {service_product?.registration_fee_amount}
                  </Label>
                </Inline>
              </Stack>
            </Container>
          </Container>

          <Container fluid size={false}>
            <Container squished size="l">
              <Heading size="s">服務內容</Heading>
            </Container>
            <Container style={{ paddingTop: 0 }}>
              <Text size="s" variant="tertiary">
                {service_product?.display_description_key}
              </Text>
            </Container>
          </Container>

          <Container fluid size={false}>
            <Container squished size="l">
              <Heading size="s">服務醫師</Heading>
            </Container>
            {internal_users.length === 0 ? (
              <Container>
                <Text>暫無可提供此項服務的醫師。</Text>
              </Container>
            ) : (
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
            )}
          </Container>
        </Stack>

        <StyledContainer fluid>
          <Link
            replace
            href={{
              pathname: '/appointments/create',
              query: { referrer: '/' },
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

export default OrganizationServiceRetrievePage
