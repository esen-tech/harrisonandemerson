import Button from '@esen/essence/components/Button'
import Checkbox from '@esen/essence/components/Checkbox'
import Container from '@esen/essence/components/Container'
import Form from '@esen/essence/components/Form'
import Heading from '@esen/essence/components/Heading'
import Hyperlink from '@esen/essence/components/Hyperlink'
import ImageCarousel from '@esen/essence/components/ImageCarousel'
import Inline from '@esen/essence/components/Inline'
import Input from '@esen/essence/components/Input'
import Label from '@esen/essence/components/Label'
import Modal from '@esen/essence/components/Modal'
import Stack from '@esen/essence/components/Stack'
import Tab from '@esen/essence/components/Tab'
import Text from '@esen/essence/components/Text'
import { getCommaSeparatedNumber } from '@esen/utils/fn'
import useTrack from '@esen/utils/hooks/useTrack'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import styled from 'styled-components'
import Banner from '../../../components/Banner'
import PageLayout from '../../../components/layout/PageLayout'
import { emersonApiAgent } from '../../../utils/apiAgent'
import { ESEN_COMPANY_ORGANIZATION_UUID } from '../../../utils/constants'

const Stage = {
  REVIEW_PRODUCT: 'REVIEW_PRODUCT',
  FILL_INFO: 'FILL_INFO',
}

const StyledContainer = styled(Container)`
  position: sticky;
  bottom: 0;
  box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.05);
`

const StyledPricing = styled(Text)`
  font-family: 'Noto Sans';
`

const OrganizationShopCareProductPage = () => {
  const router = useRouter()
  const [track] = useTrack()
  const [stage, setStage] = useState(Stage.REVIEW_PRODUCT)
  const [tab, setTab] = useState('規格說明')
  const [care_product, set_care_product] = useState()
  const [financialOrderReference, setFinancialOrderReference] = useState()
  const [order, set_order] = useState()
  const [showTermModal, setShowTermModal] = useState(false)
  const createOrderForm = useForm()
  const createFinancialOrderFormDeliveryOrderFieldArray = useFieldArray({
    control: createOrderForm.control,
    name: 'delivery_orders',
  })
  const { care_product_reference } = router.query
  const watchIsAgreeToTerms = createOrderForm.watch('isAgreeToTerms')

  useEffect(() => {
    async function fetchCareProduct() {
      await emersonApiAgent.get(
        `/product/care_products/${care_product_reference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_care_product(data)
          },
        }
      )
    }
    if (care_product_reference) {
      fetchCareProduct()
    }
  }, [care_product_reference])

  useEffect(() => {
    if (care_product) {
      new Array(care_product.delivery_order_count).fill(null).forEach(() => {
        createFinancialOrderFormDeliveryOrderFieldArray.append({
          raw_recipient_end_user_full_name: null,
          raw_recipient_end_user_phone_number: null,
          raw_served_end_user_full_name: null,
          raw_served_end_user_phone_number: null,
          isSameAsRecipientEndUser: true,
        })
      })
    }
  }, [care_product])

  useEffect(() => {
    async function fetchFinancialOrderDetail() {
      await emersonApiAgent.get(
        `/product/financial_orders/${financialOrderReference}`,
        {
          onFail: (_status, data) => {
            alert(data.message)
          },
          onSuccess: (data) => {
            set_order(data)
          },
        }
      )
    }
    if (financialOrderReference) {
      fetchFinancialOrderDetail()
    }
  }, [financialOrderReference])

  const handleSubmitCreateOrderForm = async (payload) => {
    track('submit-create-order-form', { form: payload })

    await emersonApiAgent.post(
      '/product/orders',
      {
        financial_order: {
          organization_reference: ESEN_COMPANY_ORGANIZATION_UUID,
          care_product_reference,
          invoice_email_address: payload.invoice_email_address,
          discount_code: payload.raw_discount_code,
        },
        delivery_orders: payload.delivery_orders.map((deliver_order) => {
          return {
            delivery_address: deliver_order.delivery_address,
            recipient_end_user_full_name:
              deliver_order.raw_recipient_end_user_full_name,
            recipient_end_user_phone_number:
              deliver_order.raw_recipient_end_user_phone_number,
            served_end_user_full_name: deliver_order.isSameAsRecipientEndUser
              ? deliver_order.raw_recipient_end_user_full_name
              : deliver_order.raw_served_end_user_full_name,
            served_end_user_phone_number: deliver_order.isSameAsRecipientEndUser
              ? deliver_order.raw_recipient_end_user_phone_number
              : deliver_order.raw_served_end_user_phone_number,
          }
        }),
      },
      {
        onFail: (_status, data) => {
          alert(data?.message)
        },
        onSuccess: (data) => {
          setFinancialOrderReference(data.financial_order.reference)
          const timerId = setInterval(() => {
            const formElement = document.getElementById('data_set')
            if (formElement) {
              formElement.submit()
              clearInterval(timerId)
            }
          }, 200)
        },
      }
    )
  }

  const handleHideTermModal = () => {
    createOrderForm.setValue('isAgreeToTerms', true)
    setShowTermModal(false)
  }

  return (
    <PageLayout>
      {order && (
        <div
          dangerouslySetInnerHTML={{ __html: order.ecpay_init_payment_html }}
        />
      )}
      <Stack grow={1} justifyContent="space-between" fluid>
        {stage === Stage.REVIEW_PRODUCT && (
          <Stack fluid gap="s">
            <Container size={false} fluid>
              <Banner src="/images/ĒSEN+logo.svg" width={74} height={30} />
              <ImageCarousel
                srcs={care_product?.care_product_images.map((cpi) => cpi.src)}
              />
              <Container fluid>
                <Stack gap="l">
                  <Stack gap="xs">
                    <Heading size="m">{care_product?.display_sku_key}</Heading>
                    <Stack>
                      <StyledPricing size="l" variant="negative">
                        NT$
                        {getCommaSeparatedNumber(
                          care_product?.sale_price_amount
                        )}
                      </StyledPricing>
                      <StyledPricing size="xs" disabled lineThrough>
                        $
                        {getCommaSeparatedNumber(
                          care_product?.original_price_amount
                        )}
                      </StyledPricing>
                    </Stack>
                  </Stack>
                  <Button
                    fluid
                    inversed
                    variant="primary"
                    size="s"
                    onClick={() => {
                      track('transfer-stage-to-fill-info', {
                        CTAPosition: 'bottom',
                      })
                      setStage(Stage.FILL_INFO)
                    }}
                  >
                    馬上下單
                  </Button>
                </Stack>
              </Container>
            </Container>

            <Container fluid>
              <Stack gap="m">
                <Heading size="s">商品介紹</Heading>
                <Text size="s" variant="tertiary">
                  {care_product?.display_description_key || 'N/A'}
                </Text>
              </Stack>
            </Container>

            <Container size={false} fluid>
              <Tab type="underline" fluid>
                <Tab.Item
                  active={tab === '規格說明'}
                  onClick={() => setTab('規格說明')}
                >
                  規格說明
                </Tab.Item>
                <Tab.Item
                  active={tab === '物流資訊'}
                  onClick={() => setTab('物流資訊')}
                >
                  物流資訊
                </Tab.Item>
              </Tab>
              {tab === '規格說明' && (
                <Container fluid>
                  <Stack gap="m">
                    <Heading size="s">內容物規格說明</Heading>
                    <Text size="s" variant="tertiary">
                      {care_product?.display_specification_key || 'N/A'}
                    </Text>
                  </Stack>
                </Container>
              )}
              {tab === '物流資訊' && (
                <Container fluid>
                  <Stack gap="m">
                    <Heading size="s">物流資訊</Heading>
                    <Text size="s" variant="tertiary">
                      {care_product?.display_delivery_description_key || 'N/A'}
                    </Text>
                  </Stack>
                </Container>
              )}
            </Container>

            <Container fluid>
              <Stack gap="m">
                <Heading size="s">注意事項</Heading>
                <Text size="s" variant="tertiary">
                  {care_product?.display_note || 'N/A'}
                </Text>
              </Stack>
            </Container>

            <Container fluid>
              <Inline gap="m">
                <Link
                  passHref
                  target="_blank"
                  href="https://line.me/R/ti/p/@680bokgi"
                >
                  <Button fluid size="s">
                    聯絡客服
                  </Button>
                </Link>
                <Button
                  fluid
                  inversed
                  variant="primary"
                  size="s"
                  onClick={() => {
                    track('transfer-stage-to-fill-info', { CTAPosition: 'top' })
                    setStage(Stage.FILL_INFO)
                  }}
                >
                  馬上下單
                </Button>
              </Inline>
            </Container>
          </Stack>
        )}
        {stage === Stage.FILL_INFO && (
          <Stack fluid>
            <Container size={false} fluid>
              <Banner src="/images/ĒSEN+logo.svg" width={74} height={30} />
            </Container>
            <Container size="l" squished fluid>
              <Stack gap="s" fluid>
                <Heading>寄件資訊</Heading>
                <Label size="xs" variant="secondary">
                  要注意這些資訊是採檢人還是收件人啊啊啊啊啊啊啊
                </Label>
              </Stack>
            </Container>
            <Form fluid>
              <Stack gap="s" fluid>
                {createFinancialOrderFormDeliveryOrderFieldArray.fields.map(
                  (field, idx) => {
                    const watchIsSameAsRecipientEndUser = createOrderForm.watch(
                      `delivery_orders.${idx}.isSameAsRecipientEndUser`
                    )
                    return (
                      <Container key={field.id} fluid>
                        <Stack gap="m">
                          <Inline>
                            <Heading size="s">
                              收貨人
                              {care_product.delivery_order_count > 1 &&
                                `#${idx + 1}`}
                            </Heading>
                            <Heading size="s" variant="negative">
                              *
                            </Heading>
                          </Inline>
                          <Input
                            fluid
                            placeholder="收貨人姓名"
                            {...createOrderForm.register(
                              `delivery_orders.${idx}.raw_recipient_end_user_full_name`
                            )}
                          />
                          <Input
                            fluid
                            placeholder="收貨人電話"
                            {...createOrderForm.register(
                              `delivery_orders.${idx}.raw_recipient_end_user_phone_number`
                            )}
                          />
                          <Input
                            fluid
                            placeholder="收貨人地址"
                            {...createOrderForm.register(
                              `delivery_orders.${idx}.delivery_address`
                            )}
                          />
                          <Checkbox
                            id={`isSameAsRecipientEndUser_${field.id}`}
                            {...createOrderForm.register(
                              `delivery_orders.${idx}.isSameAsRecipientEndUser`,
                              {
                                onChange: (e) => {
                                  if (!e.target.checked) {
                                    createOrderForm.setValue(
                                      `delivery_orders.${idx}.raw_served_end_user_full_name`,
                                      createOrderForm.getValues(
                                        `delivery_orders.${idx}.raw_recipient_end_user_full_name`
                                      )
                                    )
                                    createOrderForm.setValue(
                                      `delivery_orders.${idx}.raw_served_end_user_phone_number`,
                                      createOrderForm.getValues(
                                        `delivery_orders.${idx}.raw_recipient_end_user_phone_number`
                                      )
                                    )
                                  }
                                },
                              }
                            )}
                          >
                            <Label
                              htmlFor={`isSameAsRecipientEndUser_${field.id}`}
                              pointer
                            >
                              採檢人同收貨人
                            </Label>
                          </Checkbox>

                          {!watchIsSameAsRecipientEndUser && (
                            <>
                              <Inline>
                                <Heading size="s">採檢人</Heading>
                                <Heading size="s" variant="negative">
                                  *
                                </Heading>
                              </Inline>
                              <Input
                                fluid
                                placeholder="採檢人姓名"
                                {...createOrderForm.register(
                                  `delivery_orders.${idx}.raw_served_end_user_full_name`
                                )}
                              />

                              <Input
                                fluid
                                placeholder="採檢人電話"
                                {...createOrderForm.register(
                                  `delivery_orders.${idx}.raw_served_end_user_phone_number`
                                )}
                              />
                            </>
                          )}
                        </Stack>
                      </Container>
                    )
                  }
                )}

                <Container fluid>
                  <Stack gap="m">
                    <Inline>
                      <Heading size="s">收發票的Email</Heading>
                      <Heading size="s" variant="negative">
                        *
                      </Heading>
                    </Inline>
                    <Input
                      fluid
                      {...createOrderForm.register('invoice_email_address')}
                    />
                    <Checkbox
                      id="isAgreeToTerms"
                      {...createOrderForm.register('isAgreeToTerms')}
                    >
                      <Label htmlFor="isAgreeToTerms" pointer>
                        我已閱讀且同意
                        <Hyperlink onClick={() => setShowTermModal(true)}>
                          購買同意條款書
                        </Hyperlink>
                      </Label>
                    </Checkbox>
                  </Stack>
                </Container>

                {care_product.delivery_order_count === 1 && (
                  <Container fluid>
                    <Stack gap="m">
                      <Heading size="s">折扣碼</Heading>
                      <Input
                        fluid
                        placeholder="輸入折扣碼"
                        {...createOrderForm.register('raw_discount_code')}
                      />
                    </Stack>
                  </Container>
                )}
              </Stack>
            </Form>
          </Stack>
        )}
        {stage === Stage.FILL_INFO && (
          <StyledContainer fluid>
            <Button
              fluid
              inversed
              variant="primary"
              size="s"
              loading={createOrderForm.formState.isSubmitting}
              disabled={!watchIsAgreeToTerms}
              onClick={createOrderForm.handleSubmit(
                handleSubmitCreateOrderForm
              )}
            >
              前往付款
            </Button>
          </StyledContainer>
        )}
      </Stack>

      <Modal fullscreen show={showTermModal} onHide={handleHideTermModal}>
        <Container
          size={false}
          variant="secondary"
          fluid
          fill
          style={{
            overflowY: 'auto',
          }}
        >
          <Stack grow={1} justifyContent="space-between" fluid>
            <Stack fluid gap="s">
              <Container fluid>
                <Inline justifyContent="center">
                  <Label size="l">購買同意條款書</Label>
                </Inline>
              </Container>

              <Container fluid>
                <Text size="xs" variant="secondary">
                  本網站(
                  <Hyperlink href="https://app.cloud.esenmedical.com">
                    https://app.cloud.esenmedical.com
                  </Hyperlink>
                  )服務係由『伊生股份有限公司』(以下稱本公司)所建置提供，所有經線上消費之使用者(以下稱消費者或您)，敬請詳閱下列服務條款，這些服務條款訂立之目的，是為尊重智慧財產權及保護線上消費所有使用者的權益，並構成消費者與本公司間的契約。您若同意，請繼續完成線上消費手續。經您勾選同意本條文內容，或在本公司網站進行線上消費時，即視為已知悉，並同意本約定條款的所有約定。
                  注意：若您未滿十八歲，請確認您的家長或監護人已閱讀、瞭解並同意本約定條款之所有內容，並同意您瀏覽本網站，方可繼續使用本服務。
                </Text>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">一、個人資料安全</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        為了完成交易，包括且不限於完成付款及交付等，您必須擔保在加入成為會員或訂購過程中所留存的所有資料均為完整、正確、與當時情況相符的資料，如果事後有變更，您應該即時通知本公司。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        對於您所留存的資料，本公司除了採用安全交易模式外，並承諾負保密義務，除了為完成交易或提供顧客服務而提供給相關商品或服務之配合廠商以外，不會任意洩漏或提供給第三人。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        在下列情況下，本公司有權查看或提供您的個人資料給有權機關、或主張其權利受侵害並提出適當證明的第三人：
                      </Text>
                      <ul>
                        <li>
                          <Text size="xs" variant="secondary">
                            依法令規定、或依司法機關或其他有權機關的命令；
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            為完成交易或執行本約定條款、或您違反本約定條款；
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            為維護本公司系統的正常運作及安全；
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            為保護本公司其他使用者或第三人的合法權益。
                          </Text>
                        </li>
                      </ul>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        消費者對於其個人資料、付款資料（包含信用卡資料）及會員密碼等，應妥善保管以避免外洩。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">二、線上訂購</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        若您於訂購的過程中有留下正確Email，在完成線上訂購程序以後，本系統串接之金流軟體『綠界科技』會自動發送一封電子郵件給您，該項通知只是通知您本系統已經收到您的訂購訊息，不代表交易已經完成或契約已經成立，本公司將保留是否接受您的訂單的權利。
                        如果本公司確認交易條件無誤、付款完成、而且仍有存貨，本公司會依照訂單順序出貨，不另行通知；完成出貨時，您將收到物流單號。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        您完成ATM轉帳匯款，不代表交易已經完成或契約已經成立，本公司保留是否接受您的訂單的權利。如果本公司確認交易條件無誤、付款完成、而且仍有存貨，本公司會依照訂單順序出貨，不另行通知；完成出貨時，您將收到物流單號。
                        若交易條件有誤、商品無存貨、服務無法提供或有本公司無法接受訂單之情形，本公司得主動為您辦理退款。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        您所訂購的所有商品或服務，關於其品質、保固及售後服務等，本公司負責對您提供品質承諾、保固及售後服務，同時承諾協助您解決關於因為線上消費所產生的疑問或爭議。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        您一旦在本網站完成訂購程序，表示您提出要約、願意依照本約定條款及相關網頁上所載明的交易條件或限制，訂購該商品或服務。您所留存的資料(如地址、電話)如有變更，應立即上線修改所留存的資料，而且不得以資料不符為理由，否認訂購行為或拒絕付款。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        您所訂購的商品或服務，若經物流公司配送後無法送達、本公司扣除運費100元後取消該筆訂單，並將剩餘金額退款給您。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        您在本公司所進行的所有線上消費，都以本公司電腦系統所自動紀錄的電子交易資料為準，如有糾紛，並以該電子交易資料為認定標準。如果您發現交易資料不正確，應立即通知本公司。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">三、關於商品收到瑕疵與退貨條例</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        如果您所訂購的商品有瑕疵或有任何問題，請聯繫我們，我們將有專人協助您解答及處理後續事宜。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        本公司產品『不提供7日無條件退貨』，因產品屬客製化產品並且有個人衛生疑慮相關，依據「通訊交易解除權合理例外情事適用準則」，自105年1月1日開始施行，該準則就部分性質特殊之商品或服務，規定作為不適用消費者保護法第19條第1項前段之合理例外情事，以平衡企業經營者和消費者間之權益。準則第3條規定，通訊交易，經中央主管機關公告其定型化契約應記載及不得記載事項者，適用該事項關於解除契約之規定。另準則第2條規定，通訊交易之商品或服務：
                      </Text>
                      <Text size="xs" variant="secondary">
                        有下列情形之一，並經企業經營者告知消費者將排除消保法第19條第1項規定解除權之適用者，屬排除7日解除權之合理例外情事：
                      </Text>
                      <ol>
                        <li>
                          <Text size="xs" variant="secondary">
                            易於腐敗、保存期限較短或解約時即將逾期。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            依消費者要求所為之客製化給付。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            報紙、期刊或雜誌。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            經消費者拆封之影音商品或電腦軟體。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            非以有形媒介提供之數位內容或一經提供即為完成之線上服務，經消費者事先同意始提供。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            已拆封之個人衛生用品。
                          </Text>
                        </li>
                        <li>
                          <Text size="xs" variant="secondary">
                            國際航空客運服務。
                          </Text>
                        </li>
                      </ol>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">四、系統安全</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        本系統不以任何明示或默示的方式擔保您所上載或傳輸的資料將被正常顯示或處理、亦不擔保資料傳輸的正確性；如果您發現本系統有錯誤或疏失，請立即通知本公司。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        本系統會定期備份資料，但是除非本系統有故意或重大過失，本系統不對任何資料的失誤刪除、或備份錯誤或失敗負責。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">五、智慧財產權的保護</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        本網站所使用之軟體或程式、網站上所有內容，包括但不限於著作、圖片、檔案、資訊、資料、網站架構、網站畫面的安排、網頁設計，均由本網站或其他權利人依法擁有其智慧財產權，包括但不限於商標權、專利權、著作權、營業秘密與專有技術等。任何人不得逕自使用、修改、重製、公開播送、改作、散布、發行、公開發表、進行還原工程、解編或反向組譯。若使用者欲引用或轉載前述軟體、程式或網站內容，必須依法取得本網站或其他權利人的事前書面同意。尊重智慧財產權是使用者應盡的義務，如有違反，使用者應對本網站負損害賠償責任（包括但不限於訴訟費用及律師費用等）。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        在尊重他人智慧財產權之原則下，使用者同意在使用本網站之服務時，不作侵害他人智慧財產權之行為。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        若使用者有涉及侵權之情事，本網站可暫停全部或部份之服務，或逕自以取消使用者帳號之方式處理。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        若有發現智慧財產權遭侵害之情事，請將所遭侵權之情形及聯絡方式，並附具真實陳述及擁有合法智慧財產權之聲明，寄送至
                        <Hyperlink href="mailto:esen@esenmedical.com">
                          esen@esenmedical.com
                        </Hyperlink>
                        。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">六、約定條款的修改</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        除本約定條款外，您也必須應遵守相關網頁上所擬定的其他相關交易條件及說明。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        本公司保留隨時修改本約定條款的權利，修改後的約定條款將公佈在本網站上，不另外個別通知。如果您繼續在本公司進行線上訂購，就表示您已經了解、並同意遵守修改後的約定條款。若不同意本服務條款修訂或更新方式，或不接受本服務條款的其他任一約定，應立即停止使用本服務。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        本購物條款中，任何條款之全部或一部份無效時，不影響其他條款之效力。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>

              <Container fluid>
                <Stack gap="m" fluid>
                  <Heading size="s">七、準據法及管轄權</Heading>
                  <ol>
                    <li>
                      <Text size="xs" variant="secondary">
                        您在本公司所進行的所有線上訂購、交易或行為，以及本約定條款，都以中華民國法令為準據法。
                      </Text>
                    </li>
                    <li>
                      <Text size="xs" variant="secondary">
                        所有因為您在本公司進行線上訂購、交易或行為，以及因本約定條款所發生的糾紛，如果因此而涉訟，都以台北地方法院為第一審管轄法院。
                      </Text>
                    </li>
                  </ol>
                </Stack>
              </Container>
            </Stack>

            <StyledContainer fluid>
              <Button
                fluid
                inversed
                variant="primary"
                size="s"
                onClick={handleHideTermModal}
              >
                好，瞭解了
              </Button>
            </StyledContainer>
          </Stack>
        </Container>
      </Modal>
    </PageLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default OrganizationShopCareProductPage
