import Icon from '@esen/components/Icon'
import { get_full_name } from '@esen/utils/fn'
import { normalize_phone_number } from '@esen/utils/functions/form'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Image from 'react-bootstrap/Image'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import { useForm } from 'react-hook-form'
import styled from 'styled-components'
import '../../components/layout/AppLayout'
import { harrisonApiAgent } from '../../utils/apiAgent'

const StyledContainer = styled(Container)`
  max-width: 500px;
`

const StyledRow = styled(Row)`
  min-height: 100vh;
`

const StyledDescription = styled.p`
  color: #9d9c9a;
`

const Stage = {
  CREATE_LOOKUP_INTENT: 'CREATE_LOOKUP_INTENT',
  LOOKUP: 'LOOKUP',
}

const BenefitLookupPage = () => {
  const [stage, set_stage] = useState(Stage.CREATE_LOOKUP_INTENT)
  const [phone_number, set_phone_number] = useState()
  const [lookup, set_lookup] = useState()
  const {
    register,
    handleSubmit,
    formState: { isDirty },
  } = useForm()

  const handleSubmitForm = async ({ phoneNumber }) => {
    await harrisonApiAgent.get('/iam/benefits', {
      params: {
        phone_number: normalize_phone_number('+886', phoneNumber),
      },
      onFail: (_status, data) => {
        alert(data.message)
      },
      onSuccess: (data) => {
        set_phone_number(phoneNumber)
        set_lookup(data)
        set_stage(Stage.LOOKUP)
      },
    })
  }

  return (
    <StyledContainer className="overflow-hidden">
      <StyledRow className="align-items-sm-center">
        <div>
          <div className="text-center">
            <Image src="/logo.png" width="72" height="72" />
          </div>
          {stage === Stage.CREATE_LOOKUP_INTENT && (
            <Form onSubmit={handleSubmit(handleSubmitForm)}>
              <div className="pt-4 pb-2">
                <h3 className="pb-2">會員手機號碼申報</h3>
                <StyledDescription>
                  本服務僅限ĒSEN會員聯名品牌體系使用，所有個資將去識別化以防濫用，如有任何侵權行為將追究法律責任。
                </StyledDescription>
              </div>
              <Form.Group as={Col} className="mb-3">
                <Form.Control
                  placeholder="輸入手機號碼"
                  {...register('phoneNumber', { required: true })}
                  type="tel"
                />
              </Form.Group>
              <Form.Group as={Col} className="d-grid gap-2">
                <Button variant="dark" type="submit" disabled={!isDirty}>
                  驗證手機
                </Button>
              </Form.Group>
            </Form>
          )}
          {stage === Stage.LOOKUP && lookup?.end_user && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="pb-2">{get_full_name(lookup.end_user)}</h3>
                <StyledDescription>
                  {lookup.membership_type} {phone_number}
                </StyledDescription>
              </div>
              {lookup.benefits.map((benefit) => (
                <InputGroup key={benefit.display_name} className="mb-3">
                  <Form.Control
                    value={benefit.display_name}
                    disabled
                    style={{ backgroundColor: '#f6f6f6', color: 'black' }}
                  />
                  <InputGroup.Text style={{ backgroundColor: '#f6f6f6' }}>
                    {benefit.is_available ? (
                      <Icon name="check" className="text-success" />
                    ) : (
                      <Icon name="close" className="text-danger" />
                    )}
                  </InputGroup.Text>
                </InputGroup>
              ))}
              <Form.Group as={Col} className="d-grid gap-2">
                <Button
                  variant="dark"
                  onClick={() => set_stage(Stage.CREATE_LOOKUP_INTENT)}
                >
                  返回首頁
                </Button>
              </Form.Group>
            </>
          )}
          {stage === Stage.LOOKUP && !lookup.end_user && (
            <>
              <div className="pt-4 pb-2">
                <h3 className="pb-2">查無此人</h3>
                <StyledDescription>本診所並無此人資料</StyledDescription>
              </div>
              <Form.Group as={Col} className="d-grid gap-2">
                <Button
                  variant="dark"
                  onClick={() => set_stage(Stage.CREATE_LOOKUP_INTENT)}
                >
                  返回首頁
                </Button>
              </Form.Group>
            </>
          )}
        </div>
      </StyledRow>
    </StyledContainer>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default BenefitLookupPage
