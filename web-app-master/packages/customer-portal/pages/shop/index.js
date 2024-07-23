import Container from '@esen/essence/components/Container'
import Heading from '@esen/essence/components/Heading'
import Image from '@esen/essence/components/Image'
import Label from '@esen/essence/components/Label'
import Spacer from '@esen/essence/components/Spacer'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import { getCommaSeparatedNumber } from '@esen/utils/fn'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Banner from '../../components/Banner'
import PageLayout from '../../components/layout/PageLayout'
import { emersonApiAgent } from '../../utils/apiAgent'
import { ESEN_COMPANY_ORGANIZATION_UUID } from '../../utils/constants'

const StyledContainer = styled(Container)`
  cursor: pointer;
`

const StyledPricing = styled(Text)`
  font-family: 'Noto Sans';
`

const OrganizationShopPage = () => {
  const [care_products, set_care_products] = useState([])
  const [tab, setTab] = useState('個人購買')

  useEffect(() => {
    async function fetchCareProducts() {
      await emersonApiAgent.get(
        `/product/organizations/${ESEN_COMPANY_ORGANIZATION_UUID}/care_products/unexpired`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_care_products(data)
          },
        }
      )
    }
    fetchCareProducts()
  }, [])

  return (
    <PageLayout>
      <Container size={false}>
        <Banner src="/images/ĒSEN+logo.svg" width={74} height={30} />
      </Container>
      <Container size="l" squished fluid>
        <Stack gap="l" fluid>
          <Stack gap="s" fluid>
            <Heading>At ĒSEN, we care！</Heading>
            <Label size="xs" variant="tertiary">
              超值商品，任您選購
            </Label>
          </Stack>
          <Tab type="pill" fluid>
            <Tab.Item
              active={tab === '個人購買'}
              onClick={() => setTab('個人購買')}
            >
              個人購買
            </Tab.Item>
            <Tab.Item
              active={tab === '團體購買'}
              onClick={() => setTab('團體購買')}
            >
              團體購買
            </Tab.Item>
          </Tab>
        </Stack>
      </Container>

      {care_products
        .filter((cp) => {
          if (tab === '個人購買') {
            return cp.delivery_order_count === 1
          } else if (tab === '團體購買') {
            return cp.delivery_order_count > 1
          }
        })
        .map((cp) => (
          <Link key={cp.reference} href={`/shop/care_products/${cp.reference}`}>
            <StyledContainer fluid>
              <Image
                fluid
                src={
                  cp.care_product_images?.sort(
                    (a, b) => a.sequence - b.sequence
                  )?.[0]?.src
                }
              />
              <Spacer ySize="l" />
              <Stack gap="xs">
                <Heading size="s">{cp.display_sku_key}</Heading>
                <Stack>
                  <StyledPricing size="l" variant="negative" bold>
                    NT$
                    {getCommaSeparatedNumber(cp.sale_price_amount)}
                  </StyledPricing>
                  <StyledPricing size="xs" disabled lineThrough>
                    ${getCommaSeparatedNumber(cp.original_price_amount)}
                  </StyledPricing>
                </Stack>
              </Stack>
            </StyledContainer>
          </Link>
        ))}
    </PageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OrganizationShopPage
