import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
// import InputGroup from 'react-bootstrap/InputGroup'
import Header from '@esen/components/Header'
import { useRouter } from 'next/router'
import Card from 'react-bootstrap/Card'
import Image from 'react-bootstrap/Image'
import ClickableCard from '../../components/ClickableCard'
import AuthLayout from '../../components/layout/AuthLayout'

const categories = [
  {
    name: '預約診所門診',
    desc: '醫師看診、報告解說',
    image:
      'https://uploads-ssl.webflow.com/62300cf5ab663970928ebb2b/624412509be5cb659a9dec4a_wilson.png',
  },
]

const CreateAppointmentByCategoryPage = () => {
  const router = useRouter()

  return (
    <AuthLayout>
      <Form>
        <Form.Group className="mb-3">
          <Header level={1}>預約服務</Header>
        </Form.Group>
        {/* <InputGroup className="mb-3">
          <InputGroup.Text>
            <Icon name="search" />
          </InputGroup.Text>
          <Form.Control placeholder="搜尋服務" />
        </InputGroup> */}
      </Form>
      <Row>
        {categories.map((category) => (
          <Col key={category.name} xs={6}>
            <ClickableCard
              className="mb-3"
              onClick={() =>
                router.push({
                  pathname: '/appointments/create',
                  query: {
                    referrer: '/appointments/create-by-category',
                  },
                })
              }
            >
              <Card.Body>
                <Image
                  src={category.image}
                  width="45"
                  height="45"
                  roundedCircle
                  className="mb-3"
                />
                <Card.Title>{category.name}</Card.Title>
                <Card.Subtitle className="text-muted">
                  {category.desc}
                </Card.Subtitle>
              </Card.Body>
            </ClickableCard>
          </Col>
        ))}
      </Row>
    </AuthLayout>
  )
}

export const getServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale, ['common'])),
  },
})

export default CreateAppointmentByCategoryPage
